/**
 * Handles the actual dispatch of emergency notifications across
 * SMS (Twilio), Email (Nodemailer), and optionally push (FCM).
 * Every channel is fired independently and failures are isolated —
 * one channel failing must never stop the others from being tried.
 */

const twilio = require('twilio');
const nodemailer = require('nodemailer');

const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const mailTransport = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendSMS(toPhone, message) {
  if (!twilioClient) throw new Error('Twilio not configured');
  return twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to: toPhone,
  });
}

async function sendEmail(toEmail, subject, message) {
  if (!toEmail) throw new Error('No email address for contact');
  return mailTransport.sendMail({
    from: process.env.SMTP_USER,
    to: toEmail,
    subject,
    text: message,
  });
}

/**
 * Notifies a single contact across all channels available for them.
 * Returns a per-channel status report; never throws.
 */
async function notifyContact(contact, message) {
  const results = [];

  if (contact.phone) {
    try {
      await sendSMS(contact.phone, message);
      results.push({ channel: 'sms', status: 'sent' });
    } catch (err) {
      results.push({ channel: 'sms', status: 'failed', error: err.message });
    }
  }

  if (contact.email) {
    try {
      await sendEmail(contact.email, 'EMERGENCY ALERT', message);
      results.push({ channel: 'email', status: 'sent' });
    } catch (err) {
      results.push({ channel: 'email', status: 'failed', error: err.message });
    }
  }

  return { contactId: contact._id, results };
}

/**
 * Notifies a list of contacts in parallel (order pre-sorted by the AI
 * reliability ranking upstream). Waits for all to settle so the caller
 * gets a full delivery report to log against the EmergencyAlert record.
 */
async function notifyAll(contacts, message) {
  const outcomes = await Promise.allSettled(contacts.map((c) => notifyContact(c, message)));
  return outcomes.map((o, i) =>
    o.status === 'fulfilled' ? o.value : { contactId: contacts[i]._id, results: [{ channel: 'unknown', status: 'failed', error: o.reason?.message }] }
  );
}

module.exports = { notifyContact, notifyAll };
