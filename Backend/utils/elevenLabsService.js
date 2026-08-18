const https = require("https");

// Public ElevenLabs premade voices — swap these for your own cloned/library
// voices anytime from your ElevenLabs dashboard if these don't fit.
const VOICE_IDS = {
  mom: "EXAVITQu4vr4xnSDxMaL",      // Sarah - Mature, Reassuring, Confident (female)
  friend: "hpp4J3VqNfWAUOO0d1Us",   // Bella - Professional, Bright, Warm (female)
  boss: "nPczCjzI2devNBz1zQrb",     
  delivery: "dtSEyYGNJqjrtBArPCVZ", // Eric - Smooth, Trustworthy (male)
};

function textToSpeech(text, callerType) {
  return new Promise((resolve, reject) => {
    const voiceId = VOICE_IDS[callerType] || VOICE_IDS.mom;

    const payload = JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.45, similarity_boost: 0.75 },
    });

    const options = {
      hostname: "api.elevenlabs.io",
      path: `/v1/text-to-speech/${voiceId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errBody = "";
        res.on("data", (c) => (errBody += c));
        res.on("end", () =>
          reject(new Error(`ElevenLabs TTS failed: ${res.statusCode} ${errBody.slice(0, 200)}`))
        );
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { textToSpeech, VOICE_IDS };