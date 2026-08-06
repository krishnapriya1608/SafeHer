const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      default: "Safety check-in",
      trim: true,
      maxlength: 100,
    },
    // 24-hour "HH:mm" in the server's local time (e.g. "23:00").
    time: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: "time must be in HH:mm 24-hour format",
      },
    },
    // 0 = Sunday ... 6 = Saturday
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (arr) => arr.every((d) => d >= 0 && d <= 6),
        message: "daysOfWeek values must be between 0 and 6",
      },
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    gracePeriodMinutes: {
      type: Number,
      default: 10,
      min: 1,
      max: 60,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Prevents re-triggering the same scheduled check-in twice in one day.
    lastTriggeredDate: {
      type: String, // "YYYY-MM-DD"
      default: null,
    },
    lastStatus: {
      type: String,
      enum: ["idle", "pending", "confirmed", "missed"],
      default: "idle",
    },
    triggeredAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckIn", checkInSchema);
