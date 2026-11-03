import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import chatRouter     from "./routes/chat";
import draftRouter    from "./routes/draft";
import healthRouter   from "./routes/health";
import feedbackRouter from "./routes/feedback";
import knowledgeRouter from "./routes/knowledge";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — allow only the configured frontend origin ──────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));

// ── Rate limiting — 100 requests per 15 minutes per IP ───────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again later" },
});
app.use("/api", limiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "zebra-bp-backend", timestamp: new Date().toISOString() });
});

// ── Route modules ─────────────────────────────────────────────────────────────
app.use("/api", chatRouter);
app.use("/api", draftRouter);
app.use("/api", healthRouter);
app.use("/api", feedbackRouter);
app.use("/api", knowledgeRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Zebra BP backend running on http://localhost:${PORT}`);
  console.log(`Frontend origin: ${process.env.FRONTEND_URL ?? "http://localhost:5173"}`);
});

export default app;
