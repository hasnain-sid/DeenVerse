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
    updatePractice,
    deletePractice,
    getJournal,
    exportJournal,
    getStats,
} from "../controller/ruhaniController.js";
import {
    savePracticeValidationRules,
    updatePracticeValidationRules,
} from "../middlewares/validators.js";
import { practiceLimiter } from "../middlewares/rateLimiter.js";

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
router.post("/practice", isAuthenticated, practiceLimiter, savePracticeValidationRules(), saveSpiritualPractice);
router.get("/practices", isAuthenticated, getUserPractices);
router.get("/practices/:id", isAuthenticated, getPracticeById);
router.patch("/practices/:id", isAuthenticated, practiceLimiter, updatePracticeValidationRules(), updatePractice);
router.delete("/practices/:id", isAuthenticated, deletePractice);

// Registered before "/journal" so the literal path is not shadowed by any future param route
router.get("/journal/export", isAuthenticated, exportJournal);
router.get("/journal", isAuthenticated, getJournal);
router.get("/stats", isAuthenticated, getStats);

export default router;
