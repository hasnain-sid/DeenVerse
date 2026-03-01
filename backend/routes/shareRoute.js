import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getShareConfigHandler,
  shareToFeedHandler,
  getSharePreviewHandler,
} from "../controller/shareController.js";
import { shareToFeedValidationRules } from "../middlewares/validators.js";
import { shareToFeedLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public — share menu config
router.get("/config", getShareConfigHandler);

// Auth required — share content to user's feed
router.post(
  "/to-feed",
  isAuthenticated,
  shareToFeedLimiter,
  shareToFeedValidationRules(),
  shareToFeedHandler
);

// Auth required — preview how shared card will look
router.post("/preview", isAuthenticated, getSharePreviewHandler);

export default router;
