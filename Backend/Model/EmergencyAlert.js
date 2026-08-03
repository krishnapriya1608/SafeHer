const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    message: String, // final AI-generated message that was sent
    contactsNotified: [
      {
        contact: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustedContact' },
        channel: { type: String, enum: ['sms', 'email', 'call', 'push'] },
        status: { type: String, enum: ['sent', 'failed', 'acknowledged'], default: 'sent' },
        sentAt: { type: Date, default: Date.now },
        acknowledgedAt: Date,
      },
    ],
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);