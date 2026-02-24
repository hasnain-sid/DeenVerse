import { TopicReflection } from "../models/topicReflectionSchema.js";
import { getTopicBySlug } from "../data/quranTopics.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/** Max reflections returned per page */
const PAGE_SIZE = 20;

/**
 * Get paginated reflections for a topic, with author info populated.
 * @param {string} topicSlug
 * @param {number} page - 1-indexed
 * @returns {Promise<{ reflections: object[], total: number, page: number, totalPages: number }>}
 */
export async function getReflections(topicSlug, page = 1) {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) throw new AppError("Topic not found", 404);

  const skip = (page - 1) * PAGE_SIZE;

  const [reflections, total] = await Promise.all([
    TopicReflection.find({ topicSlug })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("userId", "name username avatar")
      .lean(),
    TopicReflection.countDocuments({ topicSlug }),
  ]);

  const mapped = reflections.map(formatReflection);

  return {
    reflections: mapped,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

/**
 * Create a new reflection on a topic.
 * @param {string} topicSlug
 * @param {string} userId
 * @param {string} content
 * @returns {Promise<object>}
 */
export async function createReflection(topicSlug, userId, content) {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) throw new AppError("Topic not found", 404);

  if (!content || content.trim().length < 3) {
    throw new AppError("Reflection must be at least 3 characters", 400);
  }
  if (content.length > 2000) {
    throw new AppError("Reflection must be at most 2000 characters", 400);
  }

  const reflection = await TopicReflection.create({
    topicSlug,
    userId,
    content: content.trim(),
  });

  // Populate author info for the response
  const populated = await TopicReflection.findById(reflection._id)
    .populate("userId", "name username avatar")
    .lean();

  return formatReflection(populated);
}

/**
 * Toggle like on a reflection.
 * @param {string} reflectionId
 * @param {string} userId
 * @returns {Promise<{ liked: boolean, likeCount: number }>}
 */
export async function toggleLike(reflectionId, userId) {
  const reflection = await TopicReflection.findById(reflectionId);
  if (!reflection) throw new AppError("Reflection not found", 404);

  const alreadyLiked = reflection.likes.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyLiked) {
    reflection.likes.pull(userId);
    reflection.likeCount = Math.max(0, reflection.likeCount - 1);
  } else {
    reflection.likes.addToSet(userId);
    reflection.likeCount = reflection.likes.length;
  }

  await reflection.save();

  return {
    liked: !alreadyLiked,
    likeCount: reflection.likeCount,
  };
}

/**
 * Delete a reflection (only the author can delete).
 * @param {string} reflectionId
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function deleteReflection(reflectionId, userId) {
  const reflection = await TopicReflection.findById(reflectionId);
  if (!reflection) throw new AppError("Reflection not found", 404);

  if (reflection.userId.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own reflections", 403);
  }

  await TopicReflection.findByIdAndDelete(reflectionId);
}

// ── Internal helpers ────────────────────────────────────

/**
 * Format a Mongoose lean reflection document to the shape the frontend expects.
 * @param {object} doc
 * @returns {object}
 */
function formatReflection(doc) {
  if (!doc) return null;

  const user = doc.userId || {};
  return {
    id: doc._id.toString(),
    userId: user._id?.toString() || doc.userId?.toString(),
    userName: user.name || "Anonymous",
    userAvatar: user.avatar || null,
    content: doc.content,
    likes: doc.likeCount ?? 0,
    date: doc.createdAt?.toISOString() || new Date().toISOString(),
    isScholarVerified: doc.isScholarVerified || false,
    scholarName: doc.scholarName || undefined,
    scholarNote: doc.scholarNote || undefined,
  };
}
