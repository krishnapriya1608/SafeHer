

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const AI_TIMEOUT_MS = 3000;

function templateMessage({ userName, location, timeString, relationship }) {
  const where = location?.address
    ? `near ${location.address}`
    : location?.lat
    ? `at coordinates ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    : 'at an unknown location';

  return (
    `EMERGENCY ALERT: ${userName} has triggered an SOS ${where} at ${timeString}. ` +
    `This is an automated safety alert. Please try to contact them immediately, ` +
    `and call local emergency services if you cannot reach them.`
  );
}

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), ms)),
  ]);
}

/**
 * Generates a short, calm-but-urgent emergency message tailored to the
 * recipient's relationship with the user. Always resolves — never throws —
 * so calling code can rely on getting a usable string back.
 */
async function generateAlertMessage({ userName, location, relationship = 'contact' }) {
  const timeString = new Date().toLocaleString();
  const fallback = templateMessage({ userName, location, timeString, relationship });

  if (!anthropic) return fallback;

  try {
    const mapsLink = location?.lat
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'location unavailable';

    const prompt = `Write a very short (max 3 sentences) emergency SOS text message.
Facts: sender's name is ${userName}, recipient relationship is "${relationship}",
current time is ${timeString}, location link is ${mapsLink}.
Tone: urgent but not panic-inducing, clear next action (contact them now, call emergency services if unreachable).
Output ONLY the message text, no preamble, no quotes.`;

    const response = await withTimeout(
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
      AI_TIMEOUT_MS
    );

    const text = response.content?.find((b) => b.type === 'text')?.text?.trim();
    return text && text.length > 0 ? text : fallback;
  } catch (err) {
    console.error('AI message generation failed, using template fallback:', err.message);
    return fallback;
  }
}

/**
 * Scores and sorts contacts so the most reliable responders are contacted
 * first. Pure heuristic, no external calls — always fast and available.
 *
 * score = ackRate * 0.6 + speedScore * 0.4  (higher is better)
 */
function rankContactsByReliability(contacts) {
  const scored = contacts.map((c) => {
    const stats = c.responseStats || {};
    const total = stats.totalAlertsSent || 0;
    const ackRate = total > 0 ? (stats.totalAcknowledged || 0) / total : 0.5; // neutral prior
    const avgSec = stats.avgResponseTimeSeconds;
    // Normalize speed: <=30s -> 1.0 score, >=600s (10 min) -> 0.0 score
    const speedScore = avgSec == null ? 0.5 : Math.max(0, Math.min(1, 1 - (avgSec - 30) / 570));

    const reliabilityScore = ackRate * 0.6 + speedScore * 0.4;
    // Manual priority (1 best - 10 worst) still nudges the order
    const manualBoost = (11 - (c.priority || 5)) / 10;

    return { contact: c, finalScore: reliabilityScore * 0.7 + manualBoost * 0.3 };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored.map((s) => s.contact);
}

module.exports = { generateAlertMessage, rankContactsByReliability };


const axios = require("axios");

const SYSTEM_PROMPTS = {
  "safety-guidance": `You are the SafeSphere Safety Guidance Assistant.
Give clear, practical, step-by-step personal-safety advice (situational awareness,
travel safety, home safety, digital safety, harassment prevention, safety planning).
Keep answers concise, calm, and actionable. Never give guidance that could facilitate
harm to others. If the user describes an active emergency or immediate danger, tell them
to contact local emergency services right away, before anything else.`,

  "emergency-info": `You are the SafeSphere Emergency Information Assistant.
Provide general emergency-response information: what to do in the first few minutes of
a fire, accident, natural disaster, medical emergency, or personal safety threat, and
what emergency numbers/services typically apply. Always remind the user that if this is
a real, ongoing emergency, they should call local emergency services immediately
(e.g. 112 in India, 911 in the US, 999 in the UK) rather than rely solely on this chat.
Do not provide medical, chemical, or technical instructions that could cause harm.`,

  "legal-rights": `You are the SafeSphere Legal Rights Assistant.
Explain general legal rights and protections related to personal safety (e.g. rights
during police interaction, domestic violence protections, workplace harassment
protections, filing an FIR/police report, restraining/protection orders) in plain
language. Always clarify that you are not a lawyer, this is general information and not
legal advice, and laws vary by country/state, so the user should consult a licensed
attorney or local legal aid service for their specific situation.`,

  general: `You are the SafeSphere AI Safety Assistant. Help the user with personal
safety guidance, emergency information, or legal rights questions. Be calm, clear,
and supportive. Direct users to real emergency services for active emergencies.`,
};

// Lightweight keyword flag so the frontend/backend can visually prioritize
// urgent-sounding messages. This is NOT a crisis-detection system, just a helper.
const URGENT_KEYWORDS = [
  "right now",
  "happening now",
  "help me now",
  "in danger",
  "being followed",
  "he's outside",
  "she's outside",
  "call the police",
  "emergency",
];

function flagUrgent(message) {
  const lower = message.toLowerCase();
  return URGENT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function callOpenAI(message, category) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[category] || SYSTEM_PROMPTS.general },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 700,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  return response.data.choices[0].message.content.trim();
}

async function callGemini(message, category) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(
    url,
    {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPTS[category] || SYSTEM_PROMPTS.general }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700,
      },
    },
    { timeout: 20000 }
  );

  const candidate = response.data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join("\n") || "";
  return text.trim();
}

async function getAIResponse(message, category = "general") {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const urgent = flagUrgent(message);

  let aiResponse;
  if (provider === "gemini") {
    aiResponse = await callGemini(message, category);
  } else {
    aiResponse = await callOpenAI(message, category);
  }

  return { aiResponse, provider, urgent };
}

module.exports = { getAIResponse, SYSTEM_PROMPTS };

