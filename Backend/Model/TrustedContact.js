const mongoose = require('mongoose');

const trustedContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: 100,
    },
    relationship: {
      type: String,
      enum: ['parent', 'sibling', 'spouse', 'friend', 'colleague', 'guardian', 'other'],
      default: 'other',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: (v) => /^\+?[1-9]\d{7,14}$/.test(v),
        message: (props) => `${props.value} is not a valid phone number (use E.164 format, e.g. +919876543210)`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email address',
      },
    },
    priority: {
      // Lower number = contacted first. Auto-adjusted by AI scoring service.
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    // --- Fields used by the AI priority-scoring measure ---
    responseStats: {
      totalAlertsSent: { type: Number, default: 0 },
      totalAcknowledged: { type: Number, default: 0 },
      avgResponseTimeSeconds: { type: Number, default: null },
    },
    verified: {
      type: Boolean,
      default: false, // set true after contact confirms via OTP/link
    },
  },
  { timestamps: true }
);

// A user can't add the same phone number twice
trustedContactSchema.index({ user: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('TrustedContact', trustedContactSchema);
