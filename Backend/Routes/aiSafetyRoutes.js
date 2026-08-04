const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  chat,
  getEmergencyContacts,
  getHistory,
} = require("../controllers/aiSafetyController");

// Basic abuse protection on the AI endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many requests, please slow down." },
});

router.post("/chat", chatLimiter, chat);
router.get("/emergency-contacts", getEmergencyContacts);
router.get("/history/:userId", getHistory);

module.exports = router;
