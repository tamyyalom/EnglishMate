/** Plain text-to-speech for listening to replies — not pronunciation feedback. */

let voicesReady = false;

function ensureVoices(): void {
  if (typeof window === "undefined" || voicesReady) return;
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    voicesReady = true;
    return;
  }
  synth.addEventListener(
    "voiceschanged",
    () => {
      voicesReady = true;
    },
    { once: true },
  );
}

/**
 * Speaks `text` in English using the browser voice. Cancels any current utterance.
 */
export function speakEnglish(text: string): void {
  if (typeof window === "undefined" || !text.trim()) return;
  ensureVoices();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const voices = synth.getVoices();
  const preferred =
    voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (preferred) utterance.voice = preferred;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}
