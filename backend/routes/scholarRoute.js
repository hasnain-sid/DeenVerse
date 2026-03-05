import express from "express";
import isAuthenticated from "../config/auth.js";
import { isAdmin, isScholar } from "../middlewares/admin.js";
import {
  scholarApplicationValidationRules,
  scholarReviewValidationRules,
} from "../middlewares/validators.js";
import {
  applyForScholarHandler,
  getApplicationStatusHandler,
  getScholarProfileHandler,
  listApplicationsHandler,
  reviewApplicationHandler,
  listScholarsHandler,
  stripeConnectOnboardHandler,
  stripeExpressDashboardHandler,
  stripeStatusHandler,
} from "../controller/scholarController.js";

const router = express.Router();

// ── Authenticated user routes ────────────────────────
router.post("/apply", isAuthenticated, scholarApplicationValidationRules(), applyForScholarHandler);
router.get("/application-status", isAuthenticated, getApplicationStatusHandler);

// ── Scholar routes (Stripe Connect) ──────────────────
router.post("/stripe/connect", isAuthenticated, isScholar, stripeConnectOnboardHandler);
router.get("/stripe/dashboard", isAuthenticated, isScholar, stripeExpressDashboardHandler);
router.get("/stripe/status", isAuthenticated, isScholar, stripeStatusHandler);

// ── Admin routes ─────────────────────────────────────
router.get("/admin/applications", isAuthenticated, isAdmin, listApplicationsHandler);
router.put("/admin/applications/:userId/review", isAuthenticated, isAdmin, scholarReviewValidationRules(), reviewApplicationHandler);
router.get("/admin/list", isAuthenticated, isAdmin, listScholarsHandler);

// ── Public (param routes last to avoid catching static segments) ──
router.get("/:id/profile", getScholarProfileHandler);

export default router;
