import express from "express";
import isAuthenticated from "../config/auth.js";
import {
    getTafakkurTopics,
    getTodayTafakkurTopic,
    getTafakkurTopicBySlug,
    getTazkiaTraits,
    getTazkiaTraitBySlug,
    getTadabburAyahs,
    getTodayTadabburAyah,
    getTadabburAyahByVerseKey,
    saveSpiritualPractice,
    getUserPractices,
    getPracticeById,
    getJournal,
    getStats,
} from "../controller/ruhaniController.js";

const router = express.Router();

// Public Content Routes
router.get("/tafakkur/topics", getTafakkurTopics);
router.get("/tafakkur/today", getTodayTafakkurTopic);
router.get("/tafakkur/topic/:slug", getTafakkurTopicBySlug);

router.get("/tazkia/traits", getTazkiaTraits);
router.get("/tazkia/trait/:slug", getTazkiaTraitBySlug);

router.get("/tadabbur/ayahs", getTadabburAyahs);
router.get("/tadabbur/today", getTodayTadabburAyah);
router.get("/tadabbur/ayah/:verseKey", getTadabburAyahByVerseKey);

// Protected Practice Routes (User specific)
router.post("/practice", isAuthenticated, saveSpiritualPractice);
router.get("/practices", isAuthenticated, getUserPractices);
router.get("/practices/:id", isAuthenticated, getPracticeById);
router.get("/journal", isAuthenticated, getJournal);
router.get("/stats", isAuthenticated, getStats);

export default router;
