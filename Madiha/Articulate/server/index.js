import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const envAtRepoRoot = path.resolve(serverDir, "../.env");
const envAtCwd = path.resolve(process.cwd(), ".env");

/** Trim; strip wrapping quotes from editors that save `"sk-ant-..."`. */
function normalizeApiKey(raw) {
  let s = String(raw ?? "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function loadEnvFiles() {
  // override: true so a bad ANTHROPIC_API_KEY exported in the shell does not hide your .env file.
  if (fs.existsSync(envAtRepoRoot)) {
    dotenv.config({ path: envAtRepoRoot, override: true });
  }
  let key = normalizeApiKey(process.env.ANTHROPIC_API_KEY);
  if (!key && fs.existsSync(envAtCwd) && path.resolve(envAtCwd) !== path.resolve(envAtRepoRoot)) {
    dotenv.config({ path: envAtCwd, override: true });
    key = normalizeApiKey(process.env.ANTHROPIC_API_KEY);
  }
  if (!key && !fs.existsSync(envAtRepoRoot) && fs.existsSync(envAtCwd)) {
    dotenv.config({ path: envAtCwd, override: true });
    key = normalizeApiKey(process.env.ANTHROPIC_API_KEY);
  }
  return key;
}

const apiKey = loadEnvFiles();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const isProd = process.env.NODE_ENV === "production";
const clientDist = path.resolve(serverDir, "../client/dist");

const anthropic = new Anthropic({
  apiKey,
});

const THEMES = [
  "Executive communication",
  "AI & tech fluency",
  "Confidence & presence",
  "Managing upwards",
  "Storytelling with data",
  "Technical leadership",
  "Strategic thinking",
  "Influencing without authority",
];

function lengthBlock(minutes) {
  const m = Number(minutes) || 4;
  if (m <= 2) {
    return `Target read-aloud time: about 2 minutes. Write roughly 250–380 words at a measured, articulate pace — still dense and editorial, not thin.`;
  }
  if (m <= 4) {
    return `Target read-aloud time: about 4 minutes. Write roughly 450–700 words — substantive paragraphs, no filler.`;
  }
  return `Target read-aloud time: about 6 minutes. Write roughly 750–1000 words — room to develop an idea with care, still polished throughout.`;
}

function buildSystemPrompt({
  role,
  industry,
  goals,
  topics,
  mood,
  theme,
  targetReadMinutes,
}) {
  const topicsStr = Array.isArray(topics) ? topics.join(", ") : String(topics || "");
  const r = role || "Professional";
  const ind = industry || "their field";
  const g = goals || "Not specified";
  const t = topicsStr || "Not specified";
  const moodLine = mood || "balanced";
  const th = theme || "Surprise me";
  const len = lengthBlock(targetReadMinutes);

  return `You are a writing coach and editorial director. Generate a rich, eloquent passage for a professional to read aloud as daily articulation practice. The passage should be written in a high-quality editorial style (think Harvard Business Review, McKinsey Quarterly, or a respected leadership author). 

${len}

User profile: ${r}, working in ${ind}. Career goals: ${g}. Focus areas: ${t}.
Today's energy: ${moodLine}. Requested theme: ${th}.

The passage should feel genuinely written — not like AI output. Vary sentence length. Use precise vocabulary natural to the user's industry. Make it something worth reading twice.

Return as JSON: { title, sourceLabel, passageText, focusTip, readTimeMinutes }

Respond with only a single JSON object (no markdown code fences, no commentary). Use "\\n\\n" between paragraphs in passageText. sourceLabel should read like an editorial line (e.g. "Adapted · Leadership Writing"). readTimeMinutes should match the target read-aloud duration you aimed for (approximately ${Number(targetReadMinutes) || 4}).`;
}

app.post("/api/generate-passage", async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfiguration: ANTHROPIC_API_KEY is not set.",
    });
  }

  const {
    name,
    role,
    industry,
    goals,
    topics,
    mood,
    theme: requestedTheme,
    surprise,
    targetReadMinutes: rawMinutes,
  } = req.body || {};

  const targetReadMinutes =
    typeof rawMinutes === "number" && rawMinutes > 0 ? rawMinutes : 4;

  let theme = requestedTheme;
  if (surprise || !theme || theme === "Surprise me") {
    theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  }

  const system = buildSystemPrompt({
    role: role || name,
    industry,
    goals,
    topics,
    mood,
    theme,
    targetReadMinutes,
  });

  const userMessage = `Generate today's passage. Theme to emphasize: ${theme}.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return res.status(502).json({ error: "Unexpected model response shape." });
    }

    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: "Model returned non-JSON. Try again.",
        rawPreview: raw.slice(0, 200),
      });
    }

    const {
      title,
      sourceLabel,
      passageText,
      focusTip,
      readTimeMinutes,
    } = parsed;

    if (!title || !passageText) {
      return res.status(502).json({ error: "Incomplete passage payload from model." });
    }

    return res.json({
      title: String(title),
      sourceLabel: sourceLabel ? String(sourceLabel) : "Adapted · Editorial",
      passageText: String(passageText),
      focusTip: focusTip ? String(focusTip) : "Read clearly and pause at paragraph breaks.",
      readTimeMinutes:
        typeof readTimeMinutes === "number" && readTimeMinutes > 0
          ? readTimeMinutes
          : targetReadMinutes,
      theme,
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    if (status === 401) {
      return res.status(401).json({
        error:
          "Anthropic rejected the API key (401). Create a new key at https://console.anthropic.com/settings/keys — it must start with sk-ant- and be the full string on one line in Articulate/.env as ANTHROPIC_API_KEY=... Then restart npm run dev.",
      });
    }
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: err.message || "Passage generation failed.",
    });
  }
});

app.get("/api/health", (_req, res) => {
  const looksAnthropic = apiKey.startsWith("sk-ant-") && apiKey.length > 40;
  res.json({
    ok: true,
    anthropicKeyLoaded: Boolean(apiKey),
    anthropicKeyLength: apiKey.length,
    anthropicKeyLooksFormatted: looksAnthropic,
    envFilesChecked: [envAtRepoRoot, envAtCwd].filter((p) => fs.existsSync(p)),
  });
});

if (isProd) {
  if (!fs.existsSync(clientDist)) {
    console.error(
      `[Articulate] Missing client build at ${clientDist}. Run: npm run build (from repo root) before NODE_ENV=production.`
    );
  }
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get("/", (_req, res) => {
    res.type("text").send(
      "Articulate API only (dev). Open the React app at http://localhost:5173 while `npm run dev` is running."
    );
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Articulate listening on port ${PORT}${isProd ? " (production: API + static client)" : " (API only; use Vite on 5173)"}`);
  if (!apiKey) {
    console.warn(
      `[Articulate] No ANTHROPIC_API_KEY. Set it in the environment (or ${envAtRepoRoot}) and restart.`
    );
  } else {
    const ok = apiKey.startsWith("sk-ant-") && apiKey.length > 40;
    console.log(
      `[Articulate] ANTHROPIC_API_KEY loaded (${apiKey.length} chars)${ok ? "" : " — WARNING: key should be long and start with sk-ant- (from console.anthropic.com)"}`
    );
  }
});
