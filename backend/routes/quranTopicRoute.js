import express from "express";
import {
  getTopics,
  getTopicBySlug,
  getMoods,
  getMoodById,
  searchQuran,
} from "../controller/quranTopicController.js";

const router = express.Router();

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

export default router;
