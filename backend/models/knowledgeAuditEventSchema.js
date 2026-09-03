import mongoose from "mongoose";

/**
 * Governance log for the knowledge graph.
 *
 * Deliberately separate from `AuditLog` (§1.5): that collection's `action` and
 * `targetType` enums are a closed list of moderation verbs written only by
 * moderationService, and widening them to cover graph verbs would bloat a
 * moderation log with content-governance events.
 *
 * `previousState` is borrowed from auditLogSchema.js:40-44 — the one genuinely
 * good idea there.
 */
const knowledgeAuditEventSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "link_created",
        "link_versioned",
        "decision_recorded",
        "state_derived",
        "reviewer_granted",
        "reviewer_revoked",
        "link_retired",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: [
        "knowledgeLink",
        "seerahEvent",
        "hadithRef",
        "tafsirPassage",
        "reviewDecision",
        "user",
      ],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    /** Snapshot of state before the action (for rollback and for reading history) */
    previousState: { type: mongoose.Schema.Types.Mixed, default: null },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

knowledgeAuditEventSchema.index({ createdAt: -1 });
knowledgeAuditEventSchema.index({ action: 1, createdAt: -1 });
knowledgeAuditEventSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const KnowledgeAuditEvent = mongoose.model(
  "KnowledgeAuditEvent",
  knowledgeAuditEventSchema
);
