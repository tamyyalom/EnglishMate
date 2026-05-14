import { useCallback, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { ChatMessage } from "@/components/ChatMessage";
import { CorrectionCard } from "@/components/CorrectionCard";
import { sendTutorMessage } from "@/services/aiTutor";
import { getStoredLevel } from "@/services/session";
import type { CorrectionPayload, EnglishLevel } from "@/types/tutor";
import type { ChatMessageModel } from "@/types/chat";

function createId(): string {
  return crypto.randomUUID();
}

/** Conversational tutor UI backed by the HTTP tutor API. */
export function ChatPage() {
  const initialLevel = useMemo(() => getStoredLevel() as EnglishLevel, []);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [latestCorrection, setLatestCorrection] = useState<CorrectionPayload | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<ChatMessageModel[]>(() => [
    {
      id: createId(),
      role: "assistant",
      content:
        "Hi! I am your EnglishMate tutor. Send me a sentence or topic and I will coach you step by step.",
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
          Tutor level from Practice: <strong>{initialLevel}</strong>
        </Typography>
      </Box>

      <Box sx={{ minHeight: 280 }}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </Box>

      {latestCorrection ? <CorrectionCard correction={latestCorrection} /> : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Write something in English…"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          disabled={isSending}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => void handleSend()}
          disabled={isSending || !input.trim()}
          sx={{ minWidth: { sm: 140 } }}
        >
          {isSending ? <CircularProgress size={22} color="inherit" /> : "Send"}
        </Button>
      </Stack>
    </Stack>
  );
}
