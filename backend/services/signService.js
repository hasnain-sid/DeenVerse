import Sign from "../models/signSchema.js";
import { AppError } from "../utils/AppError.js";
import { cacheGet, cacheSet } from "./cacheService.js";

/** 24 hours — daily sign rotates once per UTC day */
const DAILY_SIGN_TTL = 24 * 60 * 60;

/** 5 minutes — category list and general sign pages */
const SIGNS_TTL = 5 * 60;

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Returns a deterministic 0-based index for today's sign.
 * Varies per year so users don't see the exact same sequence annually.
 *
 * @param {number} total - Total number of published signs
 * @param {Date}   [date] - Override date (useful for tests)
 * @returns {number} 0-based index
 */
function getTodaySignIndex(total, date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86_400_000
  );
  const year = date.getFullYear();
  return (year * 367 + dayOfYear) % total;
}

/**
 * Compute UTC midnight key suffix so the Redis key changes once per day.
 * e.g. "2026-02-24"
 */
function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── Public service API ───────────────────────────────────────────

/**
 * Returns the curated sign of the day.
 * Uses a Redis-cached result that expires at the next UTC midnight.
 *
 * @returns {Promise<object>} Populated Sign document (lean)
 */
export async function getSignOfTheDay() {
  const cacheKey = `sign-of-day:${todayKey()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const total = await Sign.countDocuments({ isPublished: true });
  if (total === 0) {
    throw new AppError("No published signs available yet.", 404);
  }

  const index = getTodaySignIndex(total);

  const sign = await Sign.findOne({ isPublished: true })
    .sort({ order: 1, createdAt: 1 })
    .skip(index)
    .lean();

  if (!sign) {
    throw new AppError("Failed to retrieve the sign of the day.", 500);
  }

  await cacheSet(cacheKey, sign, DAILY_SIGN_TTL);
  return sign;
}

/**
 * Paginated list of published signs, optionally filtered by category.
 *
 * @param {object} opts
 * @param {string} [opts.category]  - Category slug filter
 * @param {number} [opts.page=1]    - 1-based page number
 * @param {number} [opts.limit=12]  - Results per page (capped at 50)
 * @returns {Promise<{signs: object[], total: number, page: number, totalPages: number}>}
 */
export async function getSignsByCategory({ category, page = 1, limit = 12 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (safePage - 1) * safeLimit;

  const cacheKey = `signs:list:${category || "all"}:${safePage}:${safeLimit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const filter = { isPublished: true };
  if (category) filter.category = category;

  const [signs, total] = await Promise.all([
    Sign.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Sign.countDocuments(filter),
  ]);

  const result = {
    signs,
    total,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit),
  };

  await cacheSet(cacheKey, result, SIGNS_TTL);
  return result;
}

/**
 * Fetch a single published sign by its MongoDB ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {Promise<object>} Lean Sign document
 */
export async function getSignById(id) {
  const cacheKey = `sign:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const sign = await Sign.findOne({ _id: id, isPublished: true }).lean();
  if (!sign) {
    throw new AppError("Sign not found.", 404);
  }

  await cacheSet(cacheKey, sign, SIGNS_TTL);
  return sign;
}

/**
 * Returns each category slug together with its published sign count.
 * Useful for rendering the category tabs with live counts.
 *
 * @returns {Promise<Array<{category: string, count: number}>>}
 */
export async function getCategories() {
  const cacheKey = "signs:categories";
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const agg = await Sign.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const result = agg.map((doc) => ({ category: doc._id, count: doc.count }));

  await cacheSet(cacheKey, result, SIGNS_TTL);
  return result;
}
