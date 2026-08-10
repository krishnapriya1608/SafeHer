const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },

    // Made optional: geolocation can be denied/unavailable, and a "Need Help"
    // check-in (feature #2) may not carry coordinates at all.
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    address: { type: String, default: "" },
    message: { type: String, default: "SOS Emergency Alert" },

    // NEW: distinguishes a full SOS from a softer "Need Help" check-in (feature #2)
    type: { type: String, enum: ["sos", "checkin"], default: "sos" },

    status: {
      type: String,
      enum: ["Active", "Accepted", "Resolved"],
      default: "Active",
    },

    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acceptedByName: { type: String, default: "" },

    // NEW: for feature #1 — surfaced on volunteer alert cards
    phone: { type: String, default: "" },
    medicalNotes: { type: String, default: "" },

    // NEW: for feature #5 — post-resolution feedback from the user
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },

    locationHistory: [
      { latitude: Number, longitude: Number, timestamp: Number },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);