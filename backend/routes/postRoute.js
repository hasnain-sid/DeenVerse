import express from "express";
import isAuthenticated from "../config/auth.js";
import { optionalAuth } from "../config/auth.js";
import { createPostValidationRules } from "../middlewares/validators.js";
import {
  createPostHandler,
  getFeedHandler,
  getPostHandler,
  toggleLikeHandler,
  toggleRepostHandler,
  getUserPostsHandler,
  deletePostHandler,
  getPostsByHashtagHandler,
  getTrendingHashtagsHandler,
} from "../controller/postController.js";
import { createPostLimiter, feedLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// ── Public routes ────────────────────────────────────
router.get("/trending/hashtags", getTrendingHashtagsHandler);
router.get("/hashtag/:hashtag", getPostsByHashtagHandler);
router.get("/user/:username", getUserPostsHandler);

// ── Authenticated routes ─────────────────────────────
router.post("/", isAuthenticated, createPostLimiter, createPostValidationRules(), createPostHandler);
router.get("/feed", isAuthenticated, feedLimiter, getFeedHandler);
router.get("/:id", optionalAuth, getPostHandler);
router.post("/:id/like", isAuthenticated, toggleLikeHandler);
router.post("/:id/repost", isAuthenticated, toggleRepostHandler);
router.delete("/:id", isAuthenticated, deletePostHandler);

export default router;
