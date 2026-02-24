import mongoose from "mongoose";

/**
 * Spaced-repetition learning progress for a user on a specific Quran topic.
 * Uses a simplified SM-2-like algorithm:
 *   repetitionLevel  → how many successful reviews (determines interval)
 *   easeFactor       → multiplier (not exposed to UI, internal scheduling)
 *   nextReviewDate   → when the user should revisit this topic
 */
const learningProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicSlug: {
      type: String,
      required: true,
    },
    /** Current spaced-repetition level (starts at 0) */
    repetitionLevel: {
      type: Number,
      default: 0,
    },
    /** Internal ease factor for interval calculation (SM-2 style) */
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
    /** When the user last reviewed this topic */
    lastReviewed: {
      type: Date,
      default: null,
    },
    /** When the next review is due */
    nextReviewDate: {
      type: Date,
      default: null,
    },
    /** Number of times the user has reviewed this topic */
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One progress record per user per topic
learningProgressSchema.index({ userId: 1, topicSlug: 1 }, { unique: true });

// For querying "what topics are due for review" for a user
learningProgressSchema.index({ userId: 1, nextReviewDate: 1 });

export const LearningProgress = mongoose.model(
  "LearningProgress",
  learningProgressSchema
);
