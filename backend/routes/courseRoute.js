import express from "express";
import isAuthenticated, { optionalAuth } from "../config/auth.js";
import { isScholar } from "../middlewares/admin.js";
import { isEnrolled } from "../middlewares/courseAccess.js";
import {
  createCourseHandler,
  browseCoursesHandler,
  getFeaturedCoursesHandler,
  getMyCoursesHandler,
  getMyTeachingHandler,
  getCourseBySlugHandler,
  updateCourseHandler,
  deleteCourseHandler,
  publishCourseHandler,
  addModuleHandler,
  updateModuleHandler,
  deleteModuleHandler,
  enrollInCourseHandler,
  getCourseProgressHandler,
  updateProgressHandler,
  getLessonContentHandler,
} from "../controller/courseController.js";
import { createQuizHandler } from "../controller/quizController.js";

const router = express.Router();

// ── Scholar routes ───────────────────────────────────
router.post("/", isAuthenticated, isScholar, createCourseHandler);

// ── Static routes (BEFORE /:slug to avoid collision) ─
router.get("/featured", getFeaturedCoursesHandler);
router.get("/my-courses", isAuthenticated, getMyCoursesHandler);
router.get("/teaching", isAuthenticated, isScholar, getMyTeachingHandler);

// ── Public browse ────────────────────────────────────
router.get("/", browseCoursesHandler);

// ── Slug-based routes ────────────────────────────────
router.get("/:slug", optionalAuth, getCourseBySlugHandler);
router.put("/:slug", isAuthenticated, updateCourseHandler);
router.delete("/:slug", isAuthenticated, deleteCourseHandler);
router.put("/:slug/publish", isAuthenticated, publishCourseHandler);

// ── Enrollment & Progress ────────────────────────────
router.post("/:slug/enroll", isAuthenticated, enrollInCourseHandler);
router.get("/:slug/progress", isAuthenticated, isEnrolled, getCourseProgressHandler);
router.put("/:slug/progress", isAuthenticated, isEnrolled, updateProgressHandler);
router.get("/:slug/lessons/:lessonId", isAuthenticated, getLessonContentHandler);

// ── Module management ────────────────────────────────
router.post("/:slug/modules", isAuthenticated, addModuleHandler);
router.put("/:slug/modules/:moduleIndex", isAuthenticated, updateModuleHandler);
router.delete("/:slug/modules/:moduleIndex", isAuthenticated, deleteModuleHandler);

// ── Quiz management (scholar) ────────────────────────
router.post("/:slug/quizzes", isAuthenticated, isScholar, createQuizHandler);

export default router;
