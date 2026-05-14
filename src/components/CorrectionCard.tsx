import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import type { CorrectionPayload } from "@/types/tutor";

type Props = {
  correction: CorrectionPayload;
};

/** Highlights a grammar fix with a short teaching tip. */
export function CorrectionCard({ correction }: Props) {
  return (
    <Card variant="outlined" sx={{ borderColor: "secondary.light", bgcolor: "rgba(196, 92, 38, 0.06)" }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label="Correction" size="small" color="secondary" variant="outlined" />
          <Typography variant="subtitle2" color="text.secondary">
            Quick fix
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Original:</strong> {correction.original}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Better:</strong> {correction.corrected}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {correction.tip}
        </Typography>
      </CardContent>
    </Card>
  );
}
