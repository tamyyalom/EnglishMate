import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Mic from "@mui/icons-material/Mic";
import Stop from "@mui/icons-material/Stop";
import { ChatMessage } from "@/components/ChatMessage";
import { CorrectionCard } from "@/components/CorrectionCard";
import { sendTutorMessage } from "@/services/aiTutor";
import { getStoredLevel } from "@/services/session";
import { useBrowserSpeechDictation } from "@/hooks/useBrowserSpeechDictation";
import type { CorrectionPayload, EnglishLevel } from "@/types/tutor";
import type { ChatMessageModel } from "@/types/chat";

function createId(): string {
  return crypto.randomUUID();
}

/** Chat with the tutor: type or use browser speech-to-text; assistant lines can use read-aloud. */
export function ChatPage() {
  const initialLevel = useMemo(() => getStoredLevel() as EnglishLevel, []);
  const [input, setInput] = useState("");
  const dictation = useBrowserSpeechDictation({
    lang: "en-US",
    onTranscriptChange: setInput,
  });
  const dictationStopRef = useRef(dictation.stop);
  dictationStopRef.current = dictation.stop;

  useEffect(() => {
    return () => dictationStopRef.current();
  }, []);

  const [isSending, setIsSending] = useState(false);
  const [latestCorrection, setLatestCorrection] = useState<CorrectionPayload | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<ChatMessageModel[]>(() => [
    {
      id: createId(),
      role: "assistant",
      content:
        "Hi! I am your EnglishMate tutor. Type here, or tap the mic to dictate in English — your speech is turned into text only (no accent scoring). Send when you are ready and I will coach you step by step.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessageModel = {
      id: createId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev: ChatMessageModel[]) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setLatestCorrection(undefined);

    try {
      const reply = await sendTutorMessage(text, initialLevel);
      const assistantMessage: ChatMessageModel = {
        id: createId(),
        role: "assistant",
        content: reply.assistantMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev: ChatMessageModel[]) => [...prev, assistantMessage]);
      setLatestCorrection(reply.correction);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Something went wrong.";
      const assistantMessage: ChatMessageModel = {
        id: createId(),
        role: "assistant",
        content: `Sorry — I could not reach the tutor just now. (${detail})`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev: ChatMessageModel[]) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, initialLevel]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tutor level from Practice: <strong>{initialLevel}</strong>. Voice is optional dictation; read-aloud uses your browser voice.
        </Typography>
      </Box>

      <Box sx={{ minHeight: 280 }}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </Box>

      {latestCorrection ? <CorrectionCard correction={latestCorrection} /> : null}

      {dictation.lastError ? (
        <Alert severity="warning" onClose={() => dictation.clearError()}>
          {dictation.lastError}
        </Alert>
      ) : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "flex-start" }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Write or dictate in English…"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          disabled={isSending || dictation.listening}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
          <Tooltip
            title={
              dictation.supported
                ? dictation.listening
                  ? "Stop dictation"
                  : "Dictate in English (speech to text)"
                : "Voice dictation is not available in this browser"
            }
          >
            <span>
              <IconButton
                color={dictation.listening ? "error" : "primary"}
                aria-label={dictation.listening ? "Stop dictation" : "Start dictation"}
                onClick={() => dictation.toggle(input)}
                disabled={isSending || !dictation.supported}
                sx={{ border: 1, borderColor: "divider" }}
              >
                {dictation.listening ? <Stop /> : <Mic />}
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            onClick={() => void handleSend()}
            disabled={isSending || !input.trim() || dictation.listening}
            sx={{ minWidth: { sm: 140 }, flex: { xs: 1, sm: "none" } }}
          >
            {isSending ? <CircularProgress size={22} color="inherit" /> : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
