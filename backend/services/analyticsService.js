import { AnalyticsEvent } from "../models/analyticsEventSchema.js";
import { User } from "../models/userSchema.js";
import { Post } from "../models/postSchema.js";

// ── Track an analytics event ─────────────────────────

export async function trackEvent(userId, event, metadata = {}, req = null) {
  try {
    await AnalyticsEvent.create({
      user: userId || null,
      event,
      metadata,
      page: metadata.page || null,
      sessionId: metadata.sessionId || null,
      userAgent: req?.headers?.["user-agent"] || null,
      ip: req?.ip || null,
    });
  } catch (err) {
    // Analytics should never break the app — fire and forget
    console.warn("Analytics track error:", err.message);
  }
}

// ── Dashboard Aggregations ───────────────────────────

/**
 * Get user growth over time
 * @param {string} period — 'day', 'week', 'month'
 * @param {number} count — how many periods back
 */
export async function getUserGrowth(period = "day", count = 30) {
  const now = new Date();
  const startDate = getStartDate(now, period, count);

  const dateFormat = period === "day" ? "%Y-%m-%d" : period === "week" ? "%Y-W%V" : "%Y-%m";

  const growth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { period: "$_id", count: 1, _id: 0 } },
  ]);

  const totalUsers = await User.countDocuments();

  return { growth, totalUsers };
}

/**
 * Get post engagement metrics
 */
export async function getEngagementMetrics(period = "day", count = 30) {
  const startDate = getStartDate(new Date(), period, count);

  const dateFormat = period === "day" ? "%Y-%m-%d" : "%Y-%m";

  const postVolume = await Post.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        posts: { $sum: 1 },
        totalLikes: { $sum: "$likeCount" },
        totalReposts: { $sum: "$repostCount" },
        totalReplies: { $sum: "$replyCount" },
        totalViews: { $sum: "$views" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        period: "$_id",
        posts: 1,
        totalLikes: 1,
        totalReposts: 1,
        totalReplies: 1,
        totalViews: 1,
        _id: 0,
      },
    },
  ]);

  return postVolume;
}

/**
 * Get event counts for the admin dashboard overview
 */
export async function getEventSummary(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const summary = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$event",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$user" },
      },
    },
    {
      $project: {
        event: "$_id",
        count: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return summary;
}

/**
 * Get top content (most liked/viewed posts)
 */
export async function getTopContent(limit = 10) {
  const topPosts = await Post.find()
    .sort({ likeCount: -1 })
    .limit(limit)
    .populate("author", "name username avatar")
    .select("content likeCount repostCount views createdAt");

  return topPosts;
}

/**
 * Get user-level insights (for profile analytics)
 */
export async function getUserInsights(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Post performance
  const postStats = await Post.aggregate([
    {
      $match: {
        author: userId,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: "$likeCount" },
        totalReposts: { $sum: "$repostCount" },
        totalViews: { $sum: "$views" },
        avgLikes: { $avg: "$likeCount" },
      },
    },
  ]);

  // Best performing post
  const bestPost = await Post.findOne({ author: userId, createdAt: { $gte: since } })
    .sort({ likeCount: -1 })
    .select("content likeCount repostCount views createdAt");

  return {
    stats: postStats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalReposts: 0,
      totalViews: 0,
      avgLikes: 0,
    },
    bestPost,
  };
}

// ── Helpers ──────────────────────────────────────────

function getStartDate(now, period, count) {
  const d = new Date(now);
  switch (period) {
    case "day":
      d.setDate(d.getDate() - count);
      break;
    case "week":
      d.setDate(d.getDate() - count * 7);
      break;
    case "month":
      d.setMonth(d.getMonth() - count);
      break;
    default:
      d.setDate(d.getDate() - count);
  }
  return d;
}
