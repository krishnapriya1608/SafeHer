const ChatLog = require("../Model/ChatLog");
const { getAIResponse } = require("../services/aiService");
const emergencyContacts = require("../Data/emergencyContact");

const VALID_CATEGORIES = ["safety-guidance", "emergency-info", "legal-rights", "general"];

// POST /api/ai-safety/chat
async function chat(req, res) {
  try {
    const { message, category = "general", userId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "message is required" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: "invalid category" });
    }

    const { aiResponse, provider, urgent } = await getAIResponse(message, category);

    // Log the interaction (non-blocking failure: don't break the chat if DB write fails)
    ChatLog.create({
      userId: userId || undefined,
      category,
      userMessage: message,
      aiResponse,
      provider,
      flaggedUrgent: urgent,
    }).catch((err) => console.error("ChatLog save failed:", err.message));

    res.json({
      success: true,
      data: {
        response: aiResponse,
        category,
        provider,
        urgent,
      },
    });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ success: false, error: "Failed to get AI response" });
  }
}

// GET /api/ai-safety/emergency-contacts?country=IN
function getEmergencyContacts(req, res) {
  const country = (req.query.country || "IN").toUpperCase();
  const data = emergencyContacts[country] || emergencyContacts.IN;
  res.json({ success: true, data });
}

// GET /api/ai-safety/history/:userId
async function getHistory(req, res) {
  try {
    const { userId } = req.params;
    const logs = await ChatLog.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
}

module.exports = { chat, getEmergencyContacts, getHistory };
