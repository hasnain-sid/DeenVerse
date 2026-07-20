import express from "express";
import isAuthenticated, { optionalAuth } from "../config/auth.js";
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
    suggestSession,
    startSession,
    updateSession,
    getSessions,
    getStats,
} from "../controller/ruhaniController.js";
import {
    savePracticeValidationRules,
    updatePracticeValidationRules,
    startSessionValidationRules,
    updateSessionValidationRules,
} from "../middlewares/validators.js";
import { practiceLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public Content Routes
router.get("/tafakkur/topics", getTafakkurTopics);
// optionalAuth so a signed-in user gets their own rotation, without requiring a session
router.get("/tafakkur/today", optionalAuth, getTodayTafakkurTopic);
router.get("/tafakkur/topic/:slug", getTafakkurTopicBySlug);

router.get("/tazkia/traits", getTazkiaTraits);
router.get("/tazkia/trait/:slug", getTazkiaTraitBySlug);

router.get("/tadabbur/ayahs", getTadabburAyahs);
router.get("/tadabbur/today", optionalAuth, getTodayTadabburAyah);
router.get("/tadabbur/ayah/:verseKey", getTadabburAyahByVerseKey);

// Protected Practice Routes (User specific)
router.post("/practice", isAuthenticated, practiceLimiter, savePracticeValidationRules(), saveSpiritualPractice);
router.get("/practices", isAuthenticated, getUserPractices);
router.get("/practices/:id", isAuthenticated, getPracticeById);
router.patch("/practices/:id", isAuthenticated, practiceLimiter, updatePracticeValidationRules(), updatePractice);
router.delete("/practices/:id", isAuthenticated, deletePractice);

// Guided sessions — literal paths registered before param routes
router.get("/session/suggest", isAuthenticated, suggestSession);
router.post("/session", isAuthenticated, practiceLimiter, startSessionValidationRules(), startSession);
router.put("/session/:id", isAuthenticated, updateSessionValidationRules(), updateSession);
router.get("/sessions", isAuthenticated, getSessions);

// Registered before "/journal" so the literal path is not shadowed by any future param route
router.get("/journal/export", isAuthenticated, exportJournal);
router.get("/journal", isAuthenticated, getJournal);
router.get("/stats", isAuthenticated, getStats);

export default router;
