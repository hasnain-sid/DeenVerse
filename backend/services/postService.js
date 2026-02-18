import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { AppError } from "../utils/AppError.js";

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
export async function createPost(userId, { content, hadithRef, images, replyTo }) {
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

  // If this is a reply, validate parent exists
  if (replyTo) {
    const parent = await Post.findById(replyTo);
    if (!parent) throw new AppError("Parent post not found", 404);
    postData.replyTo = replyTo;
  }

  const post = await Post.create(postData);

  // If reply, increment parent's reply count
  if (replyTo) {
    await Post.findByIdAndUpdate(replyTo, { $inc: { replyCount: 1 } });

    // Create notification for parent post author (if not replying to self)
    const parent = await Post.findById(replyTo).select("author");
    if (parent && parent.author.toString() !== userId) {
      await Notification.create({
        recipient: parent.author,
        sender: userId,
        type: "reply",
        post: post._id,
      });
    }
  }

  // Create mention notifications for @usernames
  const mentions = content.match(/@[\w]+/g);
  if (mentions) {
    const usernames = mentions.map((m) => m.slice(1).toLowerCase());
    const mentionedUsers = await User.find({
      username: { $in: usernames },
      _id: { $ne: userId },
    }).select("_id");

    if (mentionedUsers.length > 0) {
      const notifs = mentionedUsers.map((u) => ({
        recipient: u._id,
        sender: userId,
        type: "mention",
        post: post._id,
      }));
      await Notification.insertMany(notifs);
    }
  }

  // Populate author before returning
  await post.populate("author", "name username avatar");

  return post;
}

/**
 * Get personalized feed: posts from followed users + own posts,
 * sorted by newest. Falls back to trending if no follows.
 */
export async function getFeed(userId, { page = 1, limit = 20, tab = "following" }) {
  const skip = (page - 1) * limit;

  if (tab === "following") {
    const user = await User.findById(userId).select("following");
    const followingIds = user ? [...user.following, userId] : [userId];

    const posts = await Post.find({
      author: { $in: followingIds },
      replyTo: null, // Only top-level posts, not replies
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar")
      .lean();

    const total = await Post.countDocuments({
      author: { $in: followingIds },
      replyTo: null,
    });

    return { posts, total, page, totalPages: Math.ceil(total / limit) };
  }

  // Trending: posts with most engagement in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const posts = await Post.find({
    createdAt: { $gte: weekAgo },
    replyTo: null,
  })
    .sort({ likeCount: -1, repostCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name username avatar")
    .lean();

  const total = await Post.countDocuments({
    createdAt: { $gte: weekAgo },
    replyTo: null,
  });

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
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

  const alreadyLiked = post.likes.includes(userId);

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
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: postId,
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

  const alreadyReposted = post.reposts.includes(userId);

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
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "repost",
          post: postId,
        });
      }
    }
  }

  await post.save();
  return { reposted: !alreadyReposted, repostCount: post.repostCount };
}

/**
 * Get posts by a specific user.
 */
export async function getUserPosts(username, { page = 1, limit = 20 }) {
  const user = await User.findOne({ username }).select("_id");
  if (!user) throw new AppError("User not found", 404);

  const skip = (page - 1) * limit;

  const posts = await Post.find({ author: user._id, replyTo: null })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name username avatar")
    .lean();

  const total = await Post.countDocuments({ author: user._id, replyTo: null });

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
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
 * Get posts by hashtag.
 */
export async function getPostsByHashtag(hashtag, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const tag = hashtag.toLowerCase().replace(/^#/, "");

  const posts = await Post.find({ hashtags: tag })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name username avatar")
    .lean();

  const total = await Post.countDocuments({ hashtags: tag });

  return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get trending hashtags (most used in last 24 hours).
 */
export async function getTrendingHashtags(limit = 10) {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const trending = await Post.aggregate([
    { $match: { createdAt: { $gte: dayAgo }, hashtags: { $exists: true, $ne: [] } } },
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { hashtag: "$_id", count: 1, _id: 0 } },
  ]);

  return trending;
}
