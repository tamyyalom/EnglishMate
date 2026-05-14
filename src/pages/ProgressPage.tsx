import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { getStoredLevel } from "@/services/session";

/** Static snapshot until analytics and streaks are wired to a backend. */
export function ProgressPage() {
  const level = getStoredLevel();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Progress
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mock dashboard — replace with real metrics from your API.
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Current level focus
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          {level}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Streaks, quiz scores, and spaced repetition stats will land here.
        </Typography>
      </Paper>
    </Stack>
  );
}
