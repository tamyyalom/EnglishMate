import type { CorrectionPayload, EnglishLevel, TutorReply } from "./types.js";

const LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_MESSAGE_CHARS = 12_000;

const SYSTEM_PROMPT = `You are EnglishMate, a friendly private English tutor.

The learner's CEFR level is provided in each request. Adapt vocabulary and sentence length to that level while still sounding natural.

You must respond with a single JSON object only (no markdown fences, no extra text) matching this shape:
{
  "assistantMessage": string,
  "correction": null | {
    "original": string,
    "corrected": string,
    "tip": string
  }
}

Rules:
- "assistantMessage": Continue the conversation helpfully. If they asked a question, answer it briefly then offer one small follow-up practice idea. Keep tone encouraging.
- "correction": Use null if their latest message has no clear grammar/usage issue worth a card. If there is an issue, set "original" to a short excerpt of what they actually wrote (not a made-up sentence), "corrected" to your improved version, and "tip" to one clear teaching line.
- Never invent learner text for "original" — quote or closely paraphrase their wording.
- If the learner message is empty or only whitespace, set assistantMessage to a short welcome inviting them to share a topic or sentence, and correction to null.`;

function isEnglishLevel(value: unknown): value is EnglishLevel {
  return typeof value === "string" && LEVELS.includes(value as EnglishLevel);
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(trimmed);
  return fence?.[1]?.trim() ?? trimmed;
}

function normalizeCorrection(raw: unknown): CorrectionPayload | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const original = typeof o.original === "string" ? o.original.trim() : "";
  const corrected = typeof o.corrected === "string" ? o.corrected.trim() : "";
  const tip = typeof o.tip === "string" ? o.tip.trim() : "";
  if (!original || !corrected || !tip) return undefined;
  return { original, corrected, tip };
}

function parseTutorReply(content: string): TutorReply {
  const jsonText = stripJsonFence(content);
  const parsed: unknown = JSON.parse(jsonText);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Model JSON was not an object");
  }
  const obj = parsed as Record<string, unknown>;
  const assistantMessage =
    typeof obj.assistantMessage === "string" ? obj.assistantMessage.trim() : "";
  if (!assistantMessage) {
    throw new Error("Missing assistantMessage");
  }
  const correction = normalizeCorrection(obj.correction);
  return correction ? { assistantMessage, correction } : { assistantMessage };
}

export async function tutorFromOpenAI(
  message: string,
  level: EnglishLevel,
  apiKey: string,
): Promise<TutorReply> {
  const trimmed = message.trim();
  const userPayload = {
    level,
    learnerMessage: trimmed,
  };

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    }),
  });

  const rawText = await res.text();
  if (!res.ok) {
    const err = new Error(`OpenAI HTTP ${res.status}`) as Error & { status?: number; detail?: string };
    err.status = res.status;
    err.detail = rawText.slice(0, 500);
    throw err;
  }

  let data: unknown;
  try {
    data = JSON.parse(rawText) as unknown;
  } catch {
    throw new Error("OpenAI response was not JSON");
  }

  const choices = (data as { choices?: { message?: { content?: string } }[] }).choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty model content");
  }

  return parseTutorReply(content);
}

export function validateTutorBody(body: unknown): { message: string; level: EnglishLevel } | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const message = typeof b.message === "string" ? b.message : "";
  if (!isEnglishLevel(b.level)) return null;
  if (message.length > MAX_MESSAGE_CHARS) return null;
  return { message, level: b.level };
}
