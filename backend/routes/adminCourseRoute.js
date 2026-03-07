import express from "express";
import isAuthenticated from "../config/auth.js";
import { isAdmin } from "../middlewares/admin.js";
import {
  getAdminCoursesHandler,
  reviewCourseHandler,
} from "../controller/courseController.js";

const router = express.Router();

// ── Admin course management ──────────────────────────
router.get("/", isAuthenticated, isAdmin, getAdminCoursesHandler);
router.put("/:slug/review", isAuthenticated, isAdmin, reviewCourseHandler);

export default router;
