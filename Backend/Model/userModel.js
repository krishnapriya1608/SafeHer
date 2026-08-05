const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "volunteer", "police", "admin"],
      default: "user",
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: function () {
    return ["volunteer", "police"].includes(this.role) ? "pending" : "approved";
  },
},
plan: {
  type: String,
  enum: ["free", "pro"],
  default: "free",
},
planExpiry: {
  type: Date,
  default: null,
},
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);