import type { MouseEvent } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { EnglishLevel } from "@/types/tutor";

type Props = {
  value: EnglishLevel;
  onChange: (level: EnglishLevel) => void;
};

const LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Lets learners pick a CEFR band for practice difficulty. */
export function LevelSelector({ value, onChange }: Props) {
  const handleChange = (_: MouseEvent<HTMLElement>, next: EnglishLevel | null) => {
    if (next) onChange(next);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        Your level
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        size="small"
        color="primary"
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {LEVELS.map((level) => (
          <ToggleButton key={level} value={level} sx={{ px: 1.5 }}>
            {level}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
