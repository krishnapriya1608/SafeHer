const mongoose = require("mongoose");

const routeSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // allow anonymous / pre-login lookups too
    },

    profile: {
      type: String,
      enum: ["driving", "foot"],
      default: "driving",
    },

    origin: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    destination: {
      label: { type: String, default: "" },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    distanceMeters: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    safetyScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RouteSearch", routeSearchSchema);
