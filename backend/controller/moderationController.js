import { AppError } from "../utils/AppError.js";
import {
  createReport,
  getReports,
  resolveReport,
  dismissReport,
  banUser,
  unbanUser,
  getAuditLogs,
} from "../services/moderationService.js";

// ── User-facing: Create a report ─────────────────────

export const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const report = await createReport(req.user, { targetType, targetId, reason, description });
    res.status(201).json({ message: "Report submitted. Thank you.", report });
  } catch (err) {
    // Duplicate report
    if (err.code === 11000) {
      return next(new AppError("You have already reported this content", 409));
    }
    next(err);
  }
};

// ── Admin: List reports ──────────────────────────────

export const listReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const result = await getReports({ status, page: +page, limit: +limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ── Admin: Resolve a report ──────────────────────────

export const handleResolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution, details } = req.body;
    const report = await resolveReport(id, req.user, { resolution, details });
    res.json({ message: "Report resolved", report });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Dismiss a report ──────────────────────────

export const handleDismissReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await dismissReport(id, req.user);
    res.json({ message: "Report dismissed", report });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Ban user ──────────────────────────────────

export const handleBanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await banUser(req.user, id, reason);
    res.json({ message: `User ${user.username} has been banned`, user: { _id: user._id, username: user.username, banned: true } });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Unban user ────────────────────────────────

export const handleUnbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await unbanUser(req.user, id);
    res.json({ message: `User ${user.username} has been unbanned`, user: { _id: user._id, username: user.username, banned: false } });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Audit log ─────────────────────────────────

export const listAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const result = await getAuditLogs({ page: +page, limit: +limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
