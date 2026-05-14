/** CEFR-style level used across practice and tutor prompts. */
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Optional correction surfaced after the assistant reply. */
export type CorrectionPayload = {
  original: string;
  corrected: string;
  tip: string;
};

/** Mock (later: real API) response shape for chat. */
export type TutorReply = {
  assistantMessage: string;
  correction?: CorrectionPayload;
};
