import express from "express";
import isAuthenticated from "../config/auth.js";
import { isScholar } from "../middlewares/admin.js";
import {
  createQuizHandler,
  updateQuizHandler,
  deleteQuizHandler,
  startQuizHandler,
  submitQuizHandler,
  getQuizResultsHandler,
} from "../controller/quizController.js";

const router = express.Router();

// ── Scholar quiz management ──────────────────────────
// Note: createQuiz is mounted under /api/v1/courses/:slug/quizzes in courseRoute.js
router.put("/:quizId", isAuthenticated, isScholar, updateQuizHandler);
router.delete("/:quizId", isAuthenticated, isScholar, deleteQuizHandler);

// ── Student quiz flow ────────────────────────────────
router.post("/:quizId/start", isAuthenticated, startQuizHandler);
router.post("/:quizId/submit", isAuthenticated, submitQuizHandler);
router.get("/:quizId/results", isAuthenticated, getQuizResultsHandler);

export default router;
