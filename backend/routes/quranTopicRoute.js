import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getTopics,
  getTopicBySlug,
  getMoods,
  getMoodById,
  searchQuran,
  // Phase 3: Reflections
  getTopicReflections,
  createTopicReflection,
  likeReflection,
  deleteTopicReflection,
  // Phase 3: Learning Progress
  getProgress,
  getTopicProgressHandler,
  recordProgressReview,
  getDueReviewsHandler,
} from "../controller/quranTopicController.js";

const router = express.Router();

// ── Phase 1 (existing) ─────────────────────────────────

// GET /api/v1/quran-topics/topics → list all topics
router.get("/topics", getTopics);

// GET /api/v1/quran-topics/topics/:slug → single topic with ayahs
router.get("/topics/:slug", getTopicBySlug);

// GET /api/v1/quran-topics/moods → list all moods
router.get("/moods", getMoods);

// GET /api/v1/quran-topics/moods/:moodId → mood with resolved ayahs
router.get("/moods/:moodId", getMoodById);

// GET /api/v1/quran-topics/search?q=keyword → keyword search
router.get("/search", searchQuran);

// ── Phase 3: Community Reflections ──────────────────────

// GET /api/v1/quran-topics/topics/:slug/reflections?page=1
router.get("/topics/:slug/reflections", getTopicReflections);

// POST /api/v1/quran-topics/topics/:slug/reflections (auth required)
router.post("/topics/:slug/reflections", isAuthenticated, createTopicReflection);

// POST /api/v1/quran-topics/reflections/:reflectionId/like (auth required)
router.post("/reflections/:reflectionId/like", isAuthenticated, likeReflection);

// DELETE /api/v1/quran-topics/reflections/:reflectionId (auth required)
router.delete("/reflections/:reflectionId", isAuthenticated, deleteTopicReflection);

// ── Phase 3: Spaced Repetition / Learning Progress ──────

// GET /api/v1/quran-topics/progress (auth required — all topics)
router.get("/progress", isAuthenticated, getProgress);

// GET /api/v1/quran-topics/progress/due (auth required — topics due for review)
router.get("/progress/due", isAuthenticated, getDueReviewsHandler);

// GET /api/v1/quran-topics/topics/:slug/progress (auth required)
router.get("/topics/:slug/progress", isAuthenticated, getTopicProgressHandler);

// POST /api/v1/quran-topics/topics/:slug/progress (auth required — record review)
router.post("/topics/:slug/progress", isAuthenticated, recordProgressReview);

export default router;
