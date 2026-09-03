import mongoose from "mongoose";

/**
 * Position attached to a reviewer — one document per reviewer per edge version.
 *
 * This is multi-reviewer *record*, not consensus: two reviewers who legitimately
 * differ both stay on the page, and `KnowledgeLink.review.state` is derived from
 * these documents rather than set by any single actor (§1.4).
 */
const reviewDecisionSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeLink",
      required: true,
      index: true,
    },
    /** Decisions bind to a version. A new edge version starts with zero decisions. */
    linkVersion: { type: Number, required: true },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // must match link.review.domain AND the reviewer's grant
    domain: { type: String, required: true },
    /**
     * "challenge" is the only value a non-reviewer may write (reader report). It never
     * counts toward acceptCount/objectCount; it surfaces in the queue.
     */
    position: {
      type: String,
      required: true,
      enum: ["accept", "accept-with-note", "object", "challenge"],
    },
    note: { type: String, default: "", maxlength: 3000 },
    citedSources: [{ work: String, locator: String, url: String }],
    /** What the reviewer actually looked at */
    snapshotHash: { type: String, required: true },
    /** Set when the reviewer's grant is revoked — decision stays, authority does not */
    authorityWithdrawn: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

reviewDecisionSchema.index(
  { link: 1, linkVersion: 1, reviewer: 1 },
  { unique: true }
);

export const ReviewDecision = mongoose.model(
  "ReviewDecision",
  reviewDecisionSchema
);
