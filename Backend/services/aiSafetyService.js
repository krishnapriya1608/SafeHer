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
  const apiKey = process.env.Default_Gemini_API_Key;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  if (!apiKey) throw new Error("Default_Gemini_API_Key is not configured");

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
