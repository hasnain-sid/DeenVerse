import { LearningProgress } from "../models/learningProgressSchema.js";
import { getTopicBySlug } from "../data/quranTopics.js";
import { AppError } from "../utils/AppError.js";

/**
 * SM-2 inspired interval calculation.
 * Returns the next review date based on repetition level and ease factor.
 * @param {number} level - current repetition level
 * @param {number} ease  - ease factor (≥ 1.3)
 * @returns {number} interval in days
 */
function calculateInterval(level, ease) {
  if (level <= 0) return 1;     // first review: 1 day
  if (level === 1) return 3;    // second review: 3 days
  // After that: previous_interval * ease_factor (simplified)
  return Math.round(Math.pow(ease, level - 1) * 3);
}

/**
 * Adjust ease factor based on user's self-reported quality of recall.
 * @param {number} currentEase
 * @param {number} quality - 1 (hard) to 5 (easy)
 * @returns {number}
 */
function adjustEaseFactor(currentEase, quality) {
  // SM-2 ease formula (simplified)
  const newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(1.3, newEase); // floor at 1.3
}

/**
 * Get all learning progress records for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getUserProgress(userId) {
  const records = await LearningProgress.find({ userId })
    .sort({ nextReviewDate: 1 })
    .lean();

  return records.map(formatProgress);
}

/**
 * Get learning progress for a specific user + topic.
 * Returns null if no progress exists yet.
 * @param {string} userId
 * @param {string} topicSlug
 * @returns {Promise<object|null>}
 */
export async function getTopicProgress(userId, topicSlug) {
  const record = await LearningProgress.findOne({ userId, topicSlug }).lean();
  return record ? formatProgress(record) : null;
}

/**
 * Record a review session for a topic (creates or updates progress).
 *
 * @param {string} userId
 * @param {string} topicSlug
 * @param {number} quality - self-reported recall quality (1-5)
 *   1 = completely forgot, 5 = remembered perfectly
 * @returns {Promise<object>} updated progress
 */
export async function recordReview(userId, topicSlug, quality) {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) throw new AppError("Topic not found", 404);

  if (!Number.isInteger(quality) || quality < 1 || quality > 5) {
    throw new AppError("Quality must be an integer between 1 and 5", 400);
  }

  let progress = await LearningProgress.findOne({ userId, topicSlug });

  if (!progress) {
    // First review — create a new record
    progress = new LearningProgress({
      userId,
      topicSlug,
      repetitionLevel: 0,
      easeFactor: 2.5,
      totalReviews: 0,
    });
  }

  // Update ease factor
  progress.easeFactor = adjustEaseFactor(progress.easeFactor, quality);

  // If quality >= 3, the user remembered — advance level; otherwise reset
  if (quality >= 3) {
    progress.repetitionLevel += 1;
  } else {
    progress.repetitionLevel = Math.max(0, progress.repetitionLevel - 1);
  }

  // Calculate next review interval
  const intervalDays = calculateInterval(
    progress.repetitionLevel,
    progress.easeFactor
  );
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);

  progress.lastReviewed = new Date();
  progress.nextReviewDate = nextReview;
  progress.totalReviews += 1;

  await progress.save();

  return formatProgress(progress.toObject());
}

/**
 * Get topics that are due for review for a user (nextReviewDate ≤ now).
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getDueReviews(userId) {
  const records = await LearningProgress.find({
    userId,
    nextReviewDate: { $lte: new Date() },
  })
    .sort({ nextReviewDate: 1 })
    .lean();

  return records.map(formatProgress);
}

// ── Internal helpers ────────────────────────────────────

/**
 * Format a progress document to the shape the frontend expects.
 * @param {object} doc
 * @returns {object}
 */
function formatProgress(doc) {
  return {
    topicSlug: doc.topicSlug,
    repetitionLevel: doc.repetitionLevel,
    lastReviewed: doc.lastReviewed?.toISOString() || null,
    nextReviewDate: doc.nextReviewDate?.toISOString() || null,
    totalReviews: doc.totalReviews,
  };
}
