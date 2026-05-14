import { useCallback, useMemo, useRef, useState } from "react";

/** Local shapes for the Web Speech API to avoid clashing with partial DOM typings. */
type SpeechRecCtor = new () => SpeechRecInstance;

interface SpeechRecInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecResultEvent) => void) | null;
  onerror: ((ev: SpeechRecErrorEvent) => void) | null;
  onend: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecResultEvent {
  resultIndex: number;
  results: {
    readonly length: number;
    readonly [index: number]: {
      readonly isFinal: boolean;
      readonly 0: { readonly transcript: string };
    };
  };
}

interface SpeechRecErrorEvent {
  readonly error: string;
}

function getRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isBrowserSpeechDictationSupported(): boolean {
  return getRecognitionCtor() !== null;
}

type Options = {
  /** BCP-47 tag; browser STT quality varies by engine. */
  lang?: string;
  onTranscriptChange: (text: string) => void;
};

/**
 * Live speech-to-text in the browser (no pronunciation scoring).
 * Requires a secure context (HTTPS or localhost) and mic permission.
 */
export function useBrowserSpeechDictation({ lang = "en-US", onTranscriptChange }: Options) {
  const [listening, setListening] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecInstance | null>(null);
  const prefixRef = useRef("");

  const supported = useMemo(() => isBrowserSpeechDictationSupported(), []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      r.onend = null;
      r.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const start = useCallback(
    (existingFieldText: string) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;

      setLastError(null);
      stop();

      const prefix = existingFieldText.trim() ? `${existingFieldText.trim()} ` : "";
      prefixRef.current = prefix;

      const recognition: SpeechRecInstance = new Ctor();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecResultEvent) => {
        let segment = "";
        for (let i = 0; i < event.results.length; i++) {
          segment += event.results[i]![0]!.transcript;
        }
        onTranscriptChange(`${prefixRef.current}${segment}`.trimEnd());
      };

      recognition.onerror = (event: SpeechRecErrorEvent) => {
        if (event.error === "aborted") return;
        const friendly =
          event.error === "not-allowed"
            ? "Microphone access was blocked. Allow the mic for this site and try again."
            : event.error === "no-speech"
              ? "No speech detected — try again a little closer to the mic."
              : `Voice input paused (${event.error}).`;
        setLastError(friendly);
        recognitionRef.current = null;
        setListening(false);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };

      recognitionRef.current = recognition;
      setListening(true);
      try {
        recognition.start();
      } catch {
        setLastError("Could not start voice input.");
        recognitionRef.current = null;
        setListening(false);
      }
    },
    [lang, onTranscriptChange, stop],
  );

  const toggle = useCallback(
    (existingFieldText: string) => {
      if (listening) {
        stop();
        return;
      }
      start(existingFieldText);
    },
    [listening, start, stop],
  );

  return { listening, supported, toggle, stop, lastError, clearError: () => setLastError(null) };
}
