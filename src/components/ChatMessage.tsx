import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import type { ChatMessageModel } from "@/types/chat";
import { speakEnglish } from "@/lib/speechPlayback";

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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 0.5 }}
        >
          <Typography variant="caption" sx={{ opacity: 0.72 }}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          {!isUser ? (
            <Tooltip title="Read aloud (browser voice)">
              <IconButton
                size="small"
                aria-label="Read message aloud"
                onClick={() => speakEnglish(message.content)}
                sx={{ color: "inherit", opacity: 0.85, "&:hover": { opacity: 1 } }}
              >
                <VolumeUpOutlined fontSize="inherit" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
