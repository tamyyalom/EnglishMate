import type { EnglishLevel, TutorReply } from "@/types/tutor";

/** Simulates network latency for a more realistic UX while mocking. */
const MOCK_DELAY_MS = 700;

/**
 * Sends the learner message to a mock tutor backend.
 * Replace the body with a real HTTP call when the API is ready.
 */
export async function sendTutorMessage(
  userText: string,
  level: EnglishLevel,
): Promise<TutorReply> {
  const trimmed = userText.trim();
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const assistantMessage = buildAssistantReply(trimmed, level);
  const correction = buildOptionalCorrection(trimmed);

  return { assistantMessage, correction };
}

function buildAssistantReply(text: string, level: EnglishLevel): string {
  if (!text) {
    return "Go ahead whenever you are ready — tell me what you would like to practice today.";
  }

  return [
    `Here is a tailored idea for a ${level} learner based on what you wrote:`,
    "",
    `1) Rephrase your idea in one clearer sentence: "${text.slice(0, 120)}${text.length > 120 ? "…" : ""}"`,
    "2) Add one follow-up question you could ask a native speaker.",
    "3) Try swapping one informal word for a slightly more precise synonym.",
    "",
    "When you are done, send me your revised sentence and I will give you the next micro-task.",
  ].join("\n");
}

function buildOptionalCorrection(text: string) {
  if (text.length < 12) return undefined;

  // Lightweight heuristic so the CorrectionCard has sample content.
  const original = "I am agree with you.";
  if (text.toLowerCase().includes("agree")) {
    return {
      original,
      corrected: "I agree with you.",
      tip: 'After "I am", use an adjective or noun — not a bare verb like "agree". Prefer "I agree" or "I am in agreement".',
    };
  }

  return {
    original: "He dont likes coffee.",
    corrected: "He doesn't like coffee.",
    tip: 'Use "does not" (or "doesn\'t") for third-person negatives with most verbs.',
  };
}
