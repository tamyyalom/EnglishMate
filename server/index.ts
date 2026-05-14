import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { tutorFromOpenAI, validateTutorBody } from "./tutorLLM.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = Number(process.env.PORT) || 8787;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  res.json({ ok: true, openaiConfigured: hasKey });
});

app.post("/api/tutor", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error: "Server missing OPENAI_API_KEY. Add it to .env and restart the API.",
    });
    return;
  }

  const parsed = validateTutorBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid body. Expect { message: string, level: CEFR }." });
    return;
  }

  try {
    const reply = await tutorFromOpenAI(parsed.message, parsed.level, apiKey);
    res.json(reply);
  } catch (e: unknown) {
    const err = e as Error & { status?: number; detail?: string };
    const status = typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 502;
    console.error("[tutor]", err.message, err.detail ?? "");
    if (status === 401) {
      res.status(401).json({ error: "OpenAI rejected the API key." });
      return;
    }
    res.status(502).json({ error: "Tutor request failed. Try again in a moment." });
  }
});

app.listen(PORT, () => {
  console.log(`EnglishMate API listening on http://127.0.0.1:${PORT}`);
});
