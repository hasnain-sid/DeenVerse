import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { createAndEmitNotification } from "./notificationService.js";
import { AppError } from "../utils/AppError.js";
import { enrichSharedContent, buildShareHashtags } from "./shareEnrichment.js";
import {
  cacheFeedPage,
  getCachedFeedPage,
  invalidateFeedCache,
  cacheTrending,
  getCachedTrending,
} from "./cacheService.js";
import logger from "../config/logger.js";

// ── Cursor helpers ────────────────────────────────────

/** Max items per page (hard server-side cap). */
const MAX_LIMIT = 50;

/** Max trending hashtags returned. */
const MAX_TRENDING_LIMIT = 30;

/**
 * Encode a cursor from the last document in a page.
 * Cursor payload: { c: createdAt ISO, i: _id string }
 */
export function encodeCursor(doc) {
  if (!doc) return null;
  const payload = JSON.stringify({
    c: new Date(doc.createdAt).toISOString(),
    i: String(doc._id),
  });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Decode a cursor string back into { createdAt, _id }.
 * Returns null on any parse failure (fail-open → first page).
 */
export function decodeCursor(cursorStr) {
  if (!cursorStr) return null;
  try {
    const json = Buffer.from(cursorStr, "base64url").toString("utf8");
    const { c, i } = JSON.parse(json);
    const createdAt = new Date(c);
    if (isNaN(createdAt.getTime()) || !i) return null;
    return { createdAt, _id: i };
  } catch {
    return null;
  }
}

/**
 * Build a keyset filter for descending createdAt + _id sort.
 * Returns a Mongo $or condition that fetches rows *after* the cursor.
 */
function cursorFilter(cursor) {
  if (!cursor) return {};
  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
    ],
  };
}

/** Clamp limit to [1, MAX_LIMIT]. */
function safeLimit(limit) {
  return Math.min(Math.max(1, Number(limit) || 20), MAX_LIMIT);
}

/**
 * Parse #hashtags from post content.
 * Returns lowercase, unique hashtags without the '#'.
 */
function parseHashtags(content) {
  const matches = content.match(/#[\w\u0600-\u06FF]+/g);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

/**
 * Create a new post (or reply).
 */
export async function createPost(userId, { content, hadithRef, images, replyTo, sharedContent }) {
  if (!content || content.trim().length === 0) {
    throw new AppError("Post content is required", 400);
  }
  if (content.length > 500) {
    throw new AppError("Post content cannot exceed 500 characters", 400);
  }

  const hashtags = parseHashtags(content);

  const postData = {
    author: userId,
    content: content.trim(),
    hashtags,
  };

  if (hadithRef) postData.hadithRef = hadithRef;
  if (images && images.length > 0) postData.images = images.slice(0, 4);

  if (sharedContent && typeof sharedContent === "object") {
    // Enrich shared content with fallback titles, excerpts, meta badges
    const enriched = enrichSharedContent(sharedContent);
    if (enriched) {
      postData.sharedContent = enriched;

      // Merge kind-specific hashtags into the post's hashtags
      postData.hashtags = buildShareHashtags(enriched.kind, hashtags);
    }
  }

  // If this is a reply, validate parent exists
  let parentPost = null;
  if (replyTo) {
    parentPost = await Post.findById(replyTo).select("author");
    if (!parentPost) throw new AppError("Parent post not found", 404);
    postData.replyTo = replyTo;
  }

  const post = await Post.create(postData);

  // If reply, increment parent's reply count and notify
  if (replyTo && parentPost) {
    await Post.findByIdAndUpdate(replyTo, { $inc: { replyCount: 1 } });

    // Create notification for parent post author (if not replying to self)
    if (parentPost.author.toString() !== userId) {
      await createAndEmitNotification({
        recipientId: parentPost.author,
        senderId: userId,
        type: "reply",
        postId: post._id,
      });
    }
  }

  // Create mention notifications for @usernames (in parallel)
  const mentions = content.match(/@[\w]+/g);
  if (mentions) {
    const usernames = mentions.map((m) => m.slice(1).toLowerCase());
    const mentionedUsers = await User.find({
      username: { $in: usernames },
      _id: { $ne: userId },
    }).select("_id");

    await Promise.all(
      mentionedUsers.map((u) =>
        createAndEmitNotification({
          recipientId: u._id,
          senderId: userId,
          type: "mention",
          postId: post._id,
        })
      )
    );
  }

  // Populate author before returning
  await post.populate("author", "name username avatar");

  // Invalidate feed cache for the author (and followers will see on next refresh)
  await invalidateFeedCache(userId);

  return post;
}

/**
 * Get personalized feed: posts from followed users + own posts.
 *
 * Supports **cursor pagination** (preferred) and legacy **page** param.
 * - Cursor mode: pass `cursor` (opaque string from previous `nextCursor`).
 * - Legacy mode: pass `page` number — internally converted to skip/limit.
 *
 * @returns {{ posts, nextCursor, hasMore, _meta }}
 */
export async function getFeed(userId, { cursor, page, limit = 20, tab = "following" }) {
  const start = Date.now();
  const lim = safeLimit(limit);
  const decoded = decodeCursor(cursor);
  const useCursorMode = !!(cursor || !page); // default to cursor mode

  // Cache key includes limit + cursor signature (or "first" for initial load)
  const cacheKey = cursor || "first";
  const cached = await getCachedFeedPage(userId, tab, lim, cacheKey);
  if (cached) {
    cached._meta = { ...(cached._meta || {}), cacheHit: true };
    return cached;
  }

  let result;

  if (tab === "following") {
    const user = await User.findById(userId).select("following");
    const followingIds = user ? [...user.following, userId] : [userId];

    const baseFilter = {
      author: { $in: followingIds },
      replyTo: null,
    };

    if (useCursorMode) {
      // ── Keyset / cursor pagination ──
      const filter = { ...baseFilter, ...cursorFilter(decoded) };

      // Fetch limit + 1 to know if there are more pages
      const posts = await Post.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(lim + 1)
        .populate("author", "name username avatar")
        .lean();

      const hasMore = posts.length > lim;
      if (hasMore) posts.pop(); // remove the extra sentinel

      const nextCursor = hasMore ? encodeCursor(posts[posts.length - 1]) : null;

      result = { posts, nextCursor, hasMore };
    } else {
      // ── Legacy offset pagination (backward compat) ──
      const safePage = Math.max(1, Number(page) || 1);
      const skip = (safePage - 1) * lim;

      const [posts, total] = await Promise.all([
        Post.find(baseFilter)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(lim)
          .populate("author", "name username avatar")
          .lean(),
        Post.countDocuments(baseFilter),
      ]);

      result = {
        posts,
        total,
        page: safePage,
        totalPages: Math.ceil(total / lim),
        // Also provide cursor fields so clients can migrate
        nextCursor: posts.length === lim ? encodeCursor(posts[posts.length - 1]) : null,
        hasMore: safePage < Math.ceil(total / lim),
      };
    }
  } else {
    // ── Trending tab — keep offset-based (sort on mutable fields) ──
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const safePage = Math.max(1, Number(page) || 1);
    const skip = (safePage - 1) * lim;

    const trendingFilter = { createdAt: { $gte: weekAgo }, replyTo: null };

    const [posts, total] = await Promise.all([
      Post.find(trendingFilter)
        .sort({ likeCount: -1, repostCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate("author", "name username avatar")
        .lean(),
      Post.countDocuments(trendingFilter),
    ]);

    result = {
      posts,
      total,
      page: safePage,
      totalPages: Math.ceil(total / lim),
      nextCursor: null,
      hasMore: safePage < Math.ceil(total / lim),
    };
  }

  // Observability metadata
  result._meta = {
    cacheHit: false,
    queryTimeMs: Date.now() - start,
    resultCount: result.posts.length,
    cursorUsed: !!decoded,
  };

  // Cache the result
  await cacheFeedPage(userId, tab, lim, cacheKey, result);
  return result;
}

/**
 * Get a single post with its replies.
 */
export async function getPostById(postId, userId) {
  const post = await Post.findById(postId)
    .populate("author", "name username avatar")
    .populate({
      path: "replyTo",
      populate: { path: "author", select: "name username avatar" },
    })
    .lean();

  if (!post) throw new AppError("Post not found", 404);

  // Increment views
  await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

  // Get replies
  const replies = await Post.find({ replyTo: postId })
    .sort({ createdAt: 1 })
    .populate("author", "name username avatar")
    .lean();

  return { post, replies };
}

/**
 * Toggle like on a post.
 */
export async function toggleLike(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  const alreadyLiked = post.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    post.likes.pull(userId);
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    post.likes.push(userId);
    post.likeCount += 1;

    // Notify post author (if not self)
    if (post.author.toString() !== userId) {
      // Avoid duplicate notification — check if one exists recently
      const existing = await Notification.findOne({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: postId,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // within 1 hour
      });
      if (!existing) {
        await createAndEmitNotification({
          recipientId: post.author,
          senderId: userId,
          type: "like",
          postId,
        });
      }
    }
  }

  await post.save();
  return { liked: !alreadyLiked, likeCount: post.likeCount };
}

/**
 * Toggle repost on a post.
 */
export async function toggleRepost(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  const alreadyReposted = post.reposts.some((id) => id.toString() === userId);

  if (alreadyReposted) {
    post.reposts.pull(userId);
    post.repostCount = Math.max(0, post.repostCount - 1);
  } else {
    post.reposts.push(userId);
    post.repostCount += 1;

    // Notify post author (deduplicate — skip if already notified within 1 hour)
    if (post.author.toString() !== userId) {
      const existing = await Notification.findOne({
        recipient: post.author,
        sender: userId,
        type: "repost",
        post: postId,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });
      if (!existing) {
        await createAndEmitNotification({
          recipientId: post.author,
          senderId: userId,
          type: "repost",
          postId,
        });
      }
    }
  }

  await post.save();
  return { reposted: !alreadyReposted, repostCount: post.repostCount };
}

/**
 * Get posts by a specific user — cursor pagination.
 */
export async function getUserPosts(username, { cursor, page, limit = 20 }) {
  const start = Date.now();
  const user = await User.findOne({ username }).select("_id");
  if (!user) throw new AppError("User not found", 404);

  const lim = safeLimit(limit);
  const decoded = decodeCursor(cursor);
  const useCursorMode = !!(cursor || !page);

  const baseFilter = { author: user._id, replyTo: null };

  let result;

  if (useCursorMode) {
    const filter = { ...baseFilter, ...cursorFilter(decoded) };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(lim + 1)
      .populate("author", "name username avatar")
      .lean();

    const hasMore = posts.length > lim;
    if (hasMore) posts.pop();

    result = {
      posts,
      nextCursor: hasMore ? encodeCursor(posts[posts.length - 1]) : null,
      hasMore,
    };
  } else {
    const safePage = Math.max(1, Number(page) || 1);
    const skip = (safePage - 1) * lim;

    const [posts, total] = await Promise.all([
      Post.find(baseFilter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(lim)
        .populate("author", "name username avatar")
        .lean(),
      Post.countDocuments(baseFilter),
    ]);

    result = {
      posts,
      total,
      page: safePage,
      totalPages: Math.ceil(total / lim),
      nextCursor: posts.length === lim ? encodeCursor(posts[posts.length - 1]) : null,
      hasMore: safePage < Math.ceil(total / lim),
    };
  }

  result._meta = {
    queryTimeMs: Date.now() - start,
    resultCount: result.posts.length,
    cursorUsed: !!decoded,
  };

  return result;
}

/**
 * Delete a post (only by author).
 */
export async function deletePost(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (post.author.toString() !== userId) {
    throw new AppError("You can only delete your own posts", 403);
  }

  // If this post was a reply, decrement parent's reply count
  if (post.replyTo) {
    await Post.findByIdAndUpdate(post.replyTo, {
      $inc: { replyCount: -1 },
    });
  }

  // Delete all replies to this post
  await Post.deleteMany({ replyTo: postId });

  // Delete notifications referencing this post
  await Notification.deleteMany({ post: postId });

  await post.deleteOne();
  return { message: "Post deleted successfully" };
}

/**
 * Get posts by hashtag — cursor pagination.
 */
export async function getPostsByHashtag(hashtag, { cursor, page, limit = 20 }) {
  const start = Date.now();
  const lim = safeLimit(limit);
  const decoded = decodeCursor(cursor);
  const useCursorMode = !!(cursor || !page);
  const tag = hashtag.toLowerCase().replace(/^#/, "");

  const baseFilter = { hashtags: tag };

  let result;

  if (useCursorMode) {
    const filter = { ...baseFilter, ...cursorFilter(decoded) };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(lim + 1)
      .populate("author", "name username avatar")
      .lean();

    const hasMore = posts.length > lim;
    if (hasMore) posts.pop();

    result = {
      posts,
      nextCursor: hasMore ? encodeCursor(posts[posts.length - 1]) : null,
      hasMore,
    };
  } else {
    const safePage = Math.max(1, Number(page) || 1);
    const skip = (safePage - 1) * lim;

    const [posts, total] = await Promise.all([
      Post.find(baseFilter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(lim)
        .populate("author", "name username avatar")
        .lean(),
      Post.countDocuments(baseFilter),
    ]);

    result = {
      posts,
      total,
      page: safePage,
      totalPages: Math.ceil(total / lim),
      nextCursor: posts.length === lim ? encodeCursor(posts[posts.length - 1]) : null,
      hasMore: safePage < Math.ceil(total / lim),
    };
  }

  result._meta = {
    queryTimeMs: Date.now() - start,
    resultCount: result.posts.length,
    cursorUsed: !!decoded,
  };

  return result;
}

/**
 * Get trending hashtags (most used in last 24 hours).
 */
export async function getTrendingHashtags(limit = 10) {
  const safeTrendingLimit = Math.min(Math.max(1, Number(limit) || 10), MAX_TRENDING_LIMIT);

  // Check cache first
  const cached = await getCachedTrending();
  if (cached) return cached;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const trending = await Post.aggregate([
    { $match: { createdAt: { $gte: dayAgo }, hashtags: { $exists: true, $ne: [] } } },
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: safeTrendingLimit },
    { $project: { hashtag: "$_id", count: 1, _id: 0 } },
  ]);

  // Cache for 5 minutes
  await cacheTrending(trending);

  return trending;
}
