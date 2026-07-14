const https = require("https");

// =======================================================
// Fallback scripts — used whenever no API key is configured
// yet, or if the live API call fails for any reason. This
// means the feature works out of the box with zero setup,
// and quietly upgrades to live AI generation once a key is added.
// =======================================================
const FALLBACK_SCRIPTS = {
  mom: {
    callerName: "Mom",
    lines: [
      { text: "Hey beta, where are you right now?", pauseAfterMs: 2500 },
      { text: "Okay good. Listen, Dad wants to know what time you're coming home.", pauseAfterMs: 3000 },
      { text: "Are you eating properly? You sound distracted.", pauseAfterMs: 2500 },
      { text: "Okay, I'm sending your brother to pick you up, just stay where you are.", pauseAfterMs: 3000 },
      { text: "He's ten minutes away. Stay on the line with me till he gets there, okay?", pauseAfterMs: 3500 },
      { text: "I can hear you. I'm not hanging up. Just keep walking towards the main road.", pauseAfterMs: 4000 },
      { text: "Okay good, I see his location moving closer. Almost there.", pauseAfterMs: 3000 },
    ],
  },
  friend: {
    callerName: "Priya",
    lines: [
      { text: "Hey! Finally, I've been trying to call you for ten minutes.", pauseAfterMs: 2500 },
      { text: "Wait, are you still outside? I thought you'd be home by now.", pauseAfterMs: 3000 },
      { text: "Okay don't worry, I'm literally getting in a cab right now, I'll come to you.", pauseAfterMs: 3000 },
      { text: "Just stay on a lit street, I'm tracking your location on maps.", pauseAfterMs: 3000 },
      { text: "Two minutes away. Keep talking to me, tell me what's around you.", pauseAfterMs: 3500 },
      { text: "Okay I can see you! I'm right here, don't worry.", pauseAfterMs: 2500 },
    ],
  },
  boss: {
    callerName: "Mr. Sharma (Manager)",
    lines: [
      { text: "Hi, sorry to call so late, are you free for a minute?", pauseAfterMs: 2500 },
      { text: "I just need you to confirm the client meeting for tomorrow morning.", pauseAfterMs: 3000 },
      { text: "Also HR mentioned your cab reimbursement, can you send that receipt tonight?", pauseAfterMs: 3000 },
      { text: "Alright, and where are you right now? I might need you to stop by the office quickly.", pauseAfterMs: 3000 },
      { text: "Understood. Send me your location, I'll have the office car swing by.", pauseAfterMs: 3500 },
      { text: "Good, stay right there, the driver is close.", pauseAfterMs: 2500 },
    ],
  },
  delivery: {
    callerName: "Delivery Executive",
    lines: [
      { text: "Hello, this is your delivery partner, I'm near your location.", pauseAfterMs: 2500 },
      { text: "Can you confirm the building or landmark near you?", pauseAfterMs: 3000 },
      { text: "Okay I see it, I'm two minutes away, please stay near the main entrance.", pauseAfterMs: 3000 },
      { text: "There's someone else also waiting here for a package, is that with you?", pauseAfterMs: 3500 },
      { text: "Alright, I'm turning the corner now, I can see you.", pauseAfterMs: 2500 },
    ],
  },
};

const CALLER_LABELS = {
  mom: "Mom",
  friend: "Friend",
  boss: "Manager",
  delivery: "Delivery Executive",
};

function pickFallback(callerType) {
  const key = FALLBACK_SCRIPTS[callerType] ? callerType : "mom";
  return FALLBACK_SCRIPTS[key];
}

// Calls the Anthropic Messages API directly over HTTPS (no SDK dependency).
function callClaude({ apiKey, callerType }) {
  return new Promise((resolve, reject) => {
    const label = CALLER_LABELS[callerType] || "a close contact";

    const prompt = `Write a realistic ONE-SIDED phone call script for a safety app. Only the caller's lines are needed — the app's user stays silent/off-mic, as if listening on speakerphone in public to make it look like they're on a call.

Caller: ${label}
Tone: warm, natural, everyday — NOT scripted or dramatic. Should sound completely mundane to a bystander (asking about plans, food, location, picking them up), while subtly reassuring the user and creating a reason for someone to be "on the way" to them.
Length: 6-8 short lines.

Respond ONLY with strict JSON, no markdown, no commentary, in this exact shape:
{"callerName": "string", "lines": [{"text": "string", "pauseAfterMs": number}]}
pauseAfterMs should be between 2000 and 4000, representing a natural pause for the "user" to silently react.`;

    const payload = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.error) {
            return reject(new Error(parsed.error.message || "Anthropic API error"));
          }

          const textBlock = (parsed.content || []).find((b) => b.type === "text");

          if (!textBlock) {
            return reject(new Error("No text content returned from model"));
          }

          const cleaned = textBlock.text
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const script = JSON.parse(cleaned);

          if (!script.callerName || !Array.isArray(script.lines)) {
            return reject(new Error("Malformed script from model"));
          }

          resolve(script);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

exports.generateFakeCall = async (req, res) => {
  try {
    const { callerType } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // No key configured yet -> serve a fallback script so the feature
    // still works end-to-end while the user sets up their API key.
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        source: "fallback",
        script: pickFallback(callerType),
      });
    }

    try {
      const script = await callClaude({ apiKey, callerType });
      return res.status(200).json({
        success: true,
        source: "ai",
        script,
      });
    } catch (aiError) {
      console.log("Fake call AI generation failed, using fallback:", aiError.message);
      return res.status(200).json({
        success: true,
        source: "fallback",
        script: pickFallback(callerType),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating fake call script",
      error: error.message,
    });
  }
};
