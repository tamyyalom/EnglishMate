/** CEFR band from the client — must match `EnglishLevel` in the app. */
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type CorrectionPayload = {
  original: string;
  corrected: string;
  tip: string;
};

export type TutorReply = {
  assistantMessage: string;
  correction?: CorrectionPayload;
};
