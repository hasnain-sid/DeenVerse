import express from "express";
import isAuthenticated from "../config/auth.js";
import { optionalAuth } from "../config/auth.js";
import { isAdmin } from "../middlewares/admin.js";
import {
  track,
  dashboardOverview,
  profileInsights,
} from "../controller/analyticsController.js";
import { analyticsTrackLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// ── Track events (authenticated or anonymous) ────────
router.post("/track", optionalAuth, analyticsTrackLimiter, track);

// ── User: own profile insights ───────────────────────
router.get("/insights", isAuthenticated, profileInsights);

// ── Admin: dashboard ─────────────────────────────────
router.get("/admin/dashboard", isAuthenticated, isAdmin, dashboardOverview);

export default router;
