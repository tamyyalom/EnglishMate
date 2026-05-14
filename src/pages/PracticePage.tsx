import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { LevelSelector } from "@/components/LevelSelector";
import { getStoredLevel, setStoredLevel } from "@/services/session";
import type { EnglishLevel } from "@/types/tutor";

/** Level selection plus a simple placeholder drill scaffold. */
export function PracticePage() {
  const [level, setLevel] = useState<EnglishLevel>(() => getStoredLevel() as EnglishLevel);

  useEffect(() => {
    setStoredLevel(level);
  }, [level]);

  return (
    <Stack spacing={3}>
      <BoxWithTitle
        title="Practice"
        subtitle="Pick your CEFR band — it feeds the mock tutor prompts in Chat."
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <LevelSelector value={level} onChange={setLevel} />
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Micro-drill (placeholder)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Turn three short bullet points from your day into full {level} sentences. Tap below when you
          want a future AI check on your writing.
        </Typography>
        <Button variant="outlined" disabled>
          Submit draft (coming soon)
        </Button>
      </Paper>
    </Stack>
  );
}

function BoxWithTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}
