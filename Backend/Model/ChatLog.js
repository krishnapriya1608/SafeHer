const mongoose = require("mongoose");

const ChatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // allow anonymous use; wire up to your auth middleware if available
    },
    category: {
      type: String,
      enum: ["safety-guidance", "emergency-info", "legal-rights", "general"],
      default: "general",
    },
    userMessage: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["openai", "gemini"],
      required: true,
    },
    flaggedUrgent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatLog", ChatLogSchema);
