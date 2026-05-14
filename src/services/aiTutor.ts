import type { EnglishLevel, TutorReply } from "@/types/tutor";

const TUTOR_PATH = "/api/tutor";

function tutorEndpoint(): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (typeof base === "string" && base.trim()) {
    return `${base.replace(/\/$/, "")}${TUTOR_PATH}`;
  }
  return TUTOR_PATH;
}

type TutorErrorBody = { error?: string };

/**
 * Sends the learner message to the local tutor API (OpenAI on the server).
 * In dev, Vite proxies `/api` to the Express server on port 8787.
 */
export async function sendTutorMessage(
  userText: string,
  level: EnglishLevel,
): Promise<TutorReply> {
  const res = await fetch(tutorEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText, level }),
  });

  const raw = await res.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Tutor response was not valid JSON.");
  }

  if (!res.ok) {
    const msg =
      typeof (data as TutorErrorBody).error === "string"
        ? (data as TutorErrorBody).error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const payload = data as Partial<TutorReply> & { assistantMessage?: unknown };
  if (typeof payload.assistantMessage !== "string" || !payload.assistantMessage.trim()) {
    throw new Error("Tutor response missing assistantMessage.");
  }

  const assistantMessage = payload.assistantMessage.trim();
  const c = payload.correction;
  if (
    c &&
    typeof c === "object" &&
    typeof (c as { original?: unknown }).original === "string" &&
    typeof (c as { corrected?: unknown }).corrected === "string" &&
    typeof (c as { tip?: unknown }).tip === "string"
  ) {
    return {
      assistantMessage,
      correction: {
        original: String((c as { original: string }).original).trim(),
        corrected: String((c as { corrected: string }).corrected).trim(),
        tip: String((c as { tip: string }).tip).trim(),
      },
    };
  }

  return { assistantMessage };
}
