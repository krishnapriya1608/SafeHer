

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
