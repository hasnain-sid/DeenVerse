import express from "express";
import isAuthenticated, { optionalAuth } from "../config/auth.js";
import {
  createStreamHandler,
  getLiveStreamsHandler,
  getStreamHandler,
  startStreamHandler,
  endStreamHandler,
  getScheduledStreamsHandler,
  getRecordingsHandler,
  getMyStreamsHandler,
} from "../controller/streamController.js";

const router = express.Router();

// ── Public routes ────────────────────────────────────
router.get("/live", getLiveStreamsHandler);
router.get("/scheduled", getScheduledStreamsHandler);
router.get("/recordings", getRecordingsHandler);

// ── Authenticated routes ─────────────────────────────
// NOTE: /me/streams must come BEFORE /:id to avoid "me" matching as an id
router.get("/me/streams", isAuthenticated, getMyStreamsHandler);
router.post("/", isAuthenticated, createStreamHandler);
router.patch("/:id/start", isAuthenticated, startStreamHandler);
router.patch("/:id/end", isAuthenticated, endStreamHandler);

// ── Semi-public: optionalAuth to strip streamKey for non-owners ──
router.get("/:id", optionalAuth, getStreamHandler);

export default router;
