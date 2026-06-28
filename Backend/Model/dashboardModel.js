const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    relation: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    detail: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["normal", "warning", "danger"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

const dashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "",
    },

    medicalNotes: {
      type: String,
      default: "",
    },

    currentStatus: {
      type: String,
      enum: ["Safe", "Need Help", "Emergency"],
      default: "Safe",
    },

    emergencyContacts: [contactSchema],

    recentAlerts: [alertSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
