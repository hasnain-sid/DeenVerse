import express from "express";
import isAuthenticated from "../config/auth.js";
import { isAdmin } from "../middlewares/admin.js";
import {
  submitReport,
  listReports,
  handleResolveReport,
  handleDismissReport,
  handleBanUser,
  handleUnbanUser,
  listAuditLogs,
} from "../controller/moderationController.js";

const router = express.Router();

// ── User-facing routes ───────────────────────────────
router.post("/reports", isAuthenticated, submitReport);

// ── Admin routes ─────────────────────────────────────
router.get("/admin/reports", isAuthenticated, isAdmin, listReports);
router.patch("/admin/reports/:id/resolve", isAuthenticated, isAdmin, handleResolveReport);
router.patch("/admin/reports/:id/dismiss", isAuthenticated, isAdmin, handleDismissReport);
router.post("/admin/users/:id/ban", isAuthenticated, isAdmin, handleBanUser);
router.post("/admin/users/:id/unban", isAuthenticated, isAdmin, handleUnbanUser);
router.get("/admin/audit-log", isAuthenticated, isAdmin, listAuditLogs);

export default router;
