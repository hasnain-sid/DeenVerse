import express from "express";
import isAuthenticated from "../config/auth.js";
import {
    getDailyLearningContent,
    saveUserReflection,
    getUserLearningHistory,
} from "../controller/dailyLearningController.js";

const router = express.Router();

// GET  /api/v1/daily-learning?type=ayah       → public, no auth required
router.get("/", getDailyLearningContent);

// POST /api/v1/daily-learning/reflection       → requires auth
router.post("/reflection", isAuthenticated, saveUserReflection);

// GET  /api/v1/daily-learning/reflections?type=ayah → requires auth
router.get("/reflections", isAuthenticated, getUserLearningHistory);

export default router;
