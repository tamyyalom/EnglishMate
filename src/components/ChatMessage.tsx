import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ChatMessageModel } from "@/types/chat";

type Props = {
  message: ChatMessageModel;
};

/** Renders a single chat bubble for user or assistant turns. */
export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "85%",
          px: 2,
          py: 1.25,
          bgcolor: isUser ? "primary.main" : "grey.100",
          color: isUser ? "primary.contrastText" : "text.primary",
          borderRadius: 2,
          whiteSpace: "pre-wrap",
        }}
      >
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {message.content}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.72, display: "block", mt: 0.5 }}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Paper>
    </Box>
  );
}
