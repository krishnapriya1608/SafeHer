const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "SOS Emergency Alert",
    },

    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active",
    },
       locationHistory: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model("Emergency", emergencySchema);