import { Report } from "../models/reportSchema.js";
import { AuditLog } from "../models/auditLogSchema.js";
import { User } from "../models/userSchema.js";
import { Post } from "../models/postSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Report CRUD ──────────────────────────────────────

const TARGET_MODELS = {
  post: "Post",
  user: "User",
  message: "Message",
  stream: "Stream",
};

export async function createReport(reporterId, { targetType, targetId, reason, description }) {
  if (!TARGET_MODELS[targetType]) {
    throw new AppError("Invalid target type", 400);
  }

  // Prevent self-reporting
  if (targetType === "user" && targetId === reporterId.toString()) {
    throw new AppError("You cannot report yourself", 400);
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType,
    targetId,
    targetModel: TARGET_MODELS[targetType],
    reason,
    description: description || "",
  });

  return report;
}

export async function getReports({ status, page = 1, limit = 20 }) {
  const filter = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reporter", "name username avatar")
      .populate("reviewedBy", "name username")
      .populate("targetId"),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

export async function resolveReport(reportId, adminId, { resolution, details }) {
  const report = await Report.findById(reportId);
  if (!report) throw new AppError("Report not found", 404);
  if (report.status === "resolved") throw new AppError("Report already resolved", 400);

  report.status = "resolved";
  report.resolution = resolution;
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();
  await report.save();

  // Apply the resolution action
  await applyModeration(adminId, report, resolution, details);

  // Log the action
  await AuditLog.create({
    admin: adminId,
    action: "resolve_report",
    targetType: "report",
    targetId: reportId,
    details: `Resolution: ${resolution}. ${details || ""}`,
  });

  return report;
}

export async function dismissReport(reportId, adminId) {
  const report = await Report.findById(reportId);
  if (!report) throw new AppError("Report not found", 404);

  report.status = "dismissed";
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();
  await report.save();

  await AuditLog.create({
    admin: adminId,
    action: "dismiss_report",
    targetType: "report",
    targetId: reportId,
    details: "Report dismissed — no action taken",
  });

  return report;
}

// ── Moderation Actions ───────────────────────────────

async function applyModeration(adminId, report, resolution, details) {
  switch (resolution) {
    case "warn":
      // Could send a notification/email to the reported user
      if (report.targetType === "user") {
        await AuditLog.create({
          admin: adminId,
          action: "warn_user",
          targetType: "user",
          targetId: report.targetId,
          details: details || "Warning issued for reported behavior",
        });
      }
      break;

    case "mute_24h":
    case "mute_7d": {
      const hours = resolution === "mute_24h" ? 24 : 168;
      const muteUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
      await User.findByIdAndUpdate(report.targetId, { mutedUntil: muteUntil });
      await AuditLog.create({
        admin: adminId,
        action: "mute_user",
        targetType: "user",
        targetId: report.targetId,
        details: `Muted for ${hours} hours. ${details || ""}`,
      });
      break;
    }

    case "ban":
      await User.findByIdAndUpdate(report.targetId, { banned: true, bannedAt: new Date() });
      await AuditLog.create({
        admin: adminId,
        action: "ban_user",
        targetType: "user",
        targetId: report.targetId,
        details: details || "Account banned",
      });
      break;

    case "content_removed":
      if (report.targetType === "post") {
        await Post.findByIdAndDelete(report.targetId);
        await AuditLog.create({
          admin: adminId,
          action: "remove_post",
          targetType: "post",
          targetId: report.targetId,
          details: details || "Post removed due to report",
        });
      }
      break;

    case "no_action":
    default:
      break;
  }
}

// ── Admin User Management ────────────────────────────

export async function banUser(adminId, userId, reason) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const prev = { banned: user.banned, mutedUntil: user.mutedUntil };
  user.banned = true;
  user.bannedAt = new Date();
  await user.save();

  await AuditLog.create({
    admin: adminId,
    action: "ban_user",
    targetType: "user",
    targetId: userId,
    details: reason || "Banned by admin",
    previousState: prev,
  });

  return user;
}

export async function unbanUser(adminId, userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.banned = false;
  user.bannedAt = undefined;
  user.mutedUntil = undefined;
  await user.save();

  await AuditLog.create({
    admin: adminId,
    action: "unban_user",
    targetType: "user",
    targetId: userId,
    details: "Unbanned by admin",
  });

  return user;
}

export async function getAuditLogs({ page = 1, limit = 30 }) {
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("admin", "name username"),
    AuditLog.countDocuments(),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
