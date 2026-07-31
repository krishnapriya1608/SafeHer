const https = require("https");
const { CATEGORIES } = require("../Model/reportModel");

// Calls Claude to suggest a category/severity for a report based on its
// description. This is entirely optional — if ANTHROPIC_API_KEY isn't set,
// or the call fails for any reason, the report is just saved without a
// suggestion and nothing breaks.
function classifyReport({ description }) {
  return new Promise((resolve) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return resolve(null);

    const prompt = `A user submitted this community safety report describing an unsafe area:

"${description}"

Valid categories: ${CATEGORIES.join(", ")}

Respond ONLY with strict JSON, no markdown, no commentary, in this exact shape:
{"suggestedCategory": "one of the valid categories", "suggestedSeverity": "low" | "medium" | "high", "flaggedForReview": boolean, "note": "one short sentence, only if flaggedForReview is true, otherwise null"}

Set flaggedForReview to true ONLY if the description contains something requiring urgent human attention (e.g. an ongoing emergency, a named individual, graphic violence) — not for routine reports like poor lighting.`;

    const payload = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
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
          const textBlock = (parsed.content || []).find((b) => b.type === "text");
          if (!textBlock) return resolve(null);

          const cleaned = textBlock.text
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const result = JSON.parse(cleaned);
          resolve(result);
        } catch {
          resolve(null); // never let AI parsing issues block report submission
        }
      });
    });

    req.on("error", () => resolve(null));
    req.write(payload);
    req.end();
  });
}

module.exports = { classifyReport };
