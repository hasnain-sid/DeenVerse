import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "warn_user",
        "mute_user",
        "ban_user",
        "unban_user",
        "remove_post",
        "remove_stream",
        "resolve_report",
        "dismiss_report",
        "verify_scholar",
        "revoke_verification",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "post", "stream", "report"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    // Snapshot of state before action (for rollback)
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
