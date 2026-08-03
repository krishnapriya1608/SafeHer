const TrustedContact = require('../models/TrustedContact');
const EmergencyAlert = require('../models/EmergencyAlert');
const { generateAlertMessage, rankContactsByReliability } = require('../services/aiService');
const { notifyAll } = require('../services/notificationService');

// ---------- CRUD ----------

// POST /api/contacts
exports.addContact = async (req, res) => {
  try {
    const { name, relationship, phone, email, isPrimary } = req.body;

    const contact = await TrustedContact.create({
      user: req.user.id, // assumes auth middleware sets req.user
      name,
      relationship,
      phone,
      email,
      isPrimary: !!isPrimary,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This phone number is already saved as a trusted contact.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await TrustedContact.find({ user: req.user.id }).sort({ priority: 1, createdAt: 1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/contacts/:id
exports.editContact = async (req, res) => {
  try {
    const allowedFields = ['name', 'relationship', 'phone', 'email', 'priority', 'isPrimary'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const contact = await TrustedContact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await TrustedContact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact removed', data: { id: req.params.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Emergency Notification ----------

// POST /api/contacts/emergency
// body: { lat, lng, address }
exports.triggerEmergency = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const contacts = await TrustedContact.find({ user: req.user.id });

    if (contacts.length === 0) {
      return res.status(400).json({ success: false, message: 'No trusted contacts saved. Add at least one before triggering an alert.' });
    }

    // AI measure #1: order contacts by who responds fastest/most reliably
    const orderedContacts = rankContactsByReliability(contacts);

    // AI measure #2: generate a clear, context-aware message (with safe fallback)
    const message = await generateAlertMessage({
      userName: req.user.name || 'A trusted contact of yours',
      location: { lat, lng, address },
      relationship: orderedContacts[0]?.relationship,
    });

    const deliveryReports = await notifyAll(orderedContacts, message);

    const alert = await EmergencyAlert.create({
      user: req.user.id,
      location: { lat, lng, address },
      message,
      contactsNotified: deliveryReports.flatMap((r) =>
        r.results.map((res) => ({
          contact: r.contactId,
          channel: res.channel,
          status: res.status === 'sent' ? 'sent' : 'failed',
        }))
      ),
    });

    // fire-and-forget stat update for future ranking accuracy
    TrustedContact.updateMany(
      { _id: { $in: orderedContacts.map((c) => c._id) } },
      { $inc: { 'responseStats.totalAlertsSent': 1 } }
    ).catch((e) => console.error('Failed updating contact stats:', e.message));

    res.status(200).json({
      success: true,
      message: 'Emergency alert dispatched',
      alertId: alert._id,
      notifiedCount: orderedContacts.length,
      deliveryReports,
    });
  } catch (err) {
    console.error('Emergency trigger failed:', err);
    res.status(500).json({ success: false, message: 'Failed to send emergency alert. Please call emergency services directly.' });
  }
};

// PATCH /api/contacts/emergency/:alertId/ack/:contactId
// Called when a contact confirms receipt (e.g. taps a link in the SMS/email)
// Feeds the AI reliability scoring for future alerts.
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { alertId, contactId } = req.params;
    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const entry = alert.contactsNotified.find((c) => String(c.contact) === contactId);
    if (!entry) return res.status(404).json({ success: false, message: 'Contact was not part of this alert' });

    entry.status = 'acknowledged';
    entry.acknowledgedAt = new Date();
    await alert.save();

    const responseTimeSeconds = (entry.acknowledgedAt - entry.sentAt) / 1000;
    const contact = await TrustedContact.findById(contactId);
    if (contact) {
      const prevAvg = contact.responseStats.avgResponseTimeSeconds;
      const prevCount = contact.responseStats.totalAcknowledged;
      const newAvg = prevAvg == null ? responseTimeSeconds : (prevAvg * prevCount + responseTimeSeconds) / (prevCount + 1);

      contact.responseStats.totalAcknowledged += 1;
      contact.responseStats.avgResponseTimeSeconds = newAvg;
      await contact.save();
    }

    res.json({ success: true, message: 'Acknowledgement recorded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
