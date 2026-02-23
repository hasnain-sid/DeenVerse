import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import databaseConnection from "./config/database.js";
import { getRedisClient } from "./config/redis.js";
import logger from "./config/logger.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoute from "./routes/userRoute.js";
import collectionRoute from "./routes/collectionRoute.js";
import postRoute from "./routes/postRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import chatRoute from "./routes/chatRoute.js";
import streamRoute from "./routes/streamRoute.js";
import pushRoute from "./routes/pushRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import moderationRoute from "./routes/moderationRoute.js";
import analyticsRoute from "./routes/analyticsRoute.js";
import seoRoute from "./routes/seoRoute.js";
import healthRoute from "./routes/healthRoute.js";
import dailyAyahRoute from "./routes/dailyAyah.js";
import dailyLearningRoute from "./routes/dailyLearningRoute.js";
import quranRoute from "./routes/quranRoute.js";
import quranTopicRoute from "./routes/quranTopicRoute.js";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import { securityHeaders, sanitizeInput } from "./middlewares/security.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { initSocket } from "./socket/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: join(__dirname, ".env"),
});

// ── Database & Redis ─────────────────────────────────
databaseConnection();
getRedisClient(); // Initialise Redis (non-blocking, graceful fallback)

const app = express();

// Create HTTP server (needed for Socket.IO)
const httpServer = createServer(app);

// ── CORS (must be FIRST — handles OPTIONS preflight before anything else) ───
const productionFrontendURL =
  process.env.FRONTEND_URL_PROD || "https://deen-verse-front.vercel.app";

const extraOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const staticAllowedOrigins = new Set([
  productionFrontendURL,
  "http://localhost:3000",
  "http://localhost:3001",
  ...extraOrigins,
]);

// Matches all Vercel preview/production deployments for this project
const vercelPreviewPattern = /^https:\/\/deen-verse-front[a-z0-9-]*\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (staticAllowedOrigins.has(origin) || vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    logger.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ── Security headers (Helmet + CSP) ─────────────────
app.use(securityHeaders());

// ── HTTP request logging (Morgan → Winston) ─────────
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.info(msg.trim(), { type: "http" }) },
    skip: (req) => req.url === "/health", // Don't log health checks
  })
);

// ── Body parsing ─────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ── Input sanitisation (XSS prevention) ─────────────
app.use(sanitizeInput);

// ── Global rate limiter (100 req / min per IP) ──────
app.use(generalLimiter);

// ── Initialise Socket.IO ─────────────────────────────
initSocket(httpServer, corsOptions);

// ── SEO routes (sitemap, robots.txt) ────────────────
app.use("/", seoRoute);

// ── Health check routes (no auth required) ──────────
app.use("/health", healthRoute);

// ── REST API routes ──────────────────────────────────
app.use("/api/v1/user", userRoute);
app.use("/api/v1/collections", collectionRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/streams", streamRoute);
app.use("/api/v1/push", pushRoute);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/moderation", moderationRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/daily-ayah", dailyAyahRoute);
app.use("/api/v1/daily-learning", dailyLearningRoute);
app.use("/api/v1/quran", quranRoute);
app.use("/api/v1/quran-topics", quranTopicRoute);

// Centralized Error Handler
// This should be defined AFTER all other app.use() and routes calls
app.use(errorHandler);

const port = Number(process.env.PORT) || 8081;

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      `Port ${port} is already in use. Stop the existing process on that port and restart the backend.`
    );
    process.exit(1);
  }

  logger.error("HTTP server startup failed", { error });
  process.exit(1);
});

// Use httpServer.listen instead of app.listen for Socket.IO support
httpServer.listen(port, () => {
  logger.info(`🚀 Server listening on port ${port}`);
  logger.info(`🔌 Socket.IO ready on the same port`);
});