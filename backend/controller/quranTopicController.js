import {
  listTopics,
  listCategories,
  listMoods,
  getTopicAyahs,
  getMoodAyahs,
  searchQuranByKeyword,
} from "../services/topicService.js";
import {
  getReflections,
  createReflection,
  toggleLike,
  deleteReflection,
} from "../services/reflectionService.js";
import {
  getUserProgress,
  getTopicProgress,
  recordReview,
  getDueReviews,
} from "../services/learningProgressService.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/**
 * @desc    List all topics (lightweight catalogue)
 * @route   GET /api/v1/quran-topics/topics
 * @access  Public
 */
export const getTopics = async (_req, res, next) => {
  try {
    const topics = listTopics();
    const categories = listCategories();
    res.status(200).json({ topics, categories });
  } catch (error) {
    logger.error("Error listing topics:", error);
    next(new AppError("Failed to list topics", 500));
  }
};

/**
 * @desc    Get a single topic with all resolved ayahs
 * @route   GET /api/v1/quran-topics/topics/:slug
 * @access  Public
 */
export const getTopicBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string") {
      return next(new AppError("Topic slug is required", 400));
    }

    const topic = await getTopicAyahs(slug);
    if (!topic) {
      return next(new AppError("Topic not found", 404));
    }

    res.status(200).json(topic);
  } catch (error) {
    logger.error(`Error fetching topic ${req.params.slug}:`, error);
    next(new AppError("Failed to fetch topic", 500));
  }
};

/**
 * @desc    List all moods
 * @route   GET /api/v1/quran-topics/moods
 * @access  Public
 */
export const getMoods = async (_req, res, next) => {
  try {
    const moods = listMoods();
    res.status(200).json({ moods });
  } catch (error) {
    logger.error("Error listing moods:", error);
    next(new AppError("Failed to list moods", 500));
  }
};

/**
 * @desc    Get ayahs for a specific mood
 * @route   GET /api/v1/quran-topics/moods/:moodId
 * @access  Public
 */
export const getMoodById = async (req, res, next) => {
  try {
    const { moodId } = req.params;

    if (!moodId || typeof moodId !== "string") {
      return next(new AppError("Mood ID is required", 400));
    }

    const mood = await getMoodAyahs(moodId);
    if (!mood) {
      return next(new AppError("Mood not found", 404));
    }

    res.status(200).json(mood);
  } catch (error) {
    logger.error(`Error fetching mood ${req.params.moodId}:`, error);
    next(new AppError("Failed to fetch mood", 500));
  }
};

/**
 * @desc    Search the Quran by keyword
 * @route   GET /api/v1/quran-topics/search?q=keyword
 * @access  Public
 */
export const searchQuran = async (req, res, next) => {
  try {
    const keyword = req.query.q;

    if (!keyword || typeof keyword !== "string" || keyword.trim().length < 2) {
      return next(new AppError("Search query must be at least 2 characters", 400));
    }

    // Limit keyword length to prevent abuse
    if (keyword.length > 100) {
      return next(new AppError("Search query too long", 400));
    }

    const results = await searchQuranByKeyword(keyword.trim());
    res.status(200).json(results);
  } catch (error) {
    logger.error(`Error searching Quran for "${req.query.q}":`, error);
    next(new AppError("Failed to search Quran", 500));
  }
};

// ── Phase 3: Community Reflections ─────────────────────

/**
 * @desc    Get reflections for a topic (paginated)
 * @route   GET /api/v1/quran-topics/topics/:slug/reflections?page=1
 * @access  Public
 */
export const getTopicReflections = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const result = await getReflections(slug, page);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error fetching reflections for ${req.params.slug}:`, error);
    next(new AppError("Failed to fetch reflections", 500));
  }
};

/**
 * @desc    Create a reflection on a topic
 * @route   POST /api/v1/quran-topics/topics/:slug/reflections
 * @access  Private (auth required)
 */
export const createTopicReflection = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { content } = req.body;
    const userId = req.user;

    if (!userId) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const reflection = await createReflection(slug, userId, content);
    res.status(201).json({ success: true, reflection });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error creating reflection for ${req.params.slug}:`, error);
    next(new AppError("Failed to create reflection", 500));
  }
};

/**
 * @desc    Toggle like on a reflection
 * @route   POST /api/v1/quran-topics/reflections/:reflectionId/like
 * @access  Private (auth required)
 */
export const likeReflection = async (req, res, next) => {
  try {
    const { reflectionId } = req.params;
    const userId = req.user;

    if (!userId) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const result = await toggleLike(reflectionId, userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error toggling like on reflection ${req.params.reflectionId}:`, error);
    next(new AppError("Failed to toggle like", 500));
  }
};

/**
 * @desc    Delete a reflection (own only)
 * @route   DELETE /api/v1/quran-topics/reflections/:reflectionId
 * @access  Private (auth required)
 */
export const deleteTopicReflection = async (req, res, next) => {
  try {
    const { reflectionId } = req.params;
    const userId = req.user;

    if (!userId) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    await deleteReflection(reflectionId, userId);
    res.status(200).json({ success: true, message: "Reflection deleted" });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error deleting reflection ${req.params.reflectionId}:`, error);
    next(new AppError("Failed to delete reflection", 500));
  }
};

// ── Phase 3: Spaced Repetition / Learning Progress ─────

/**
 * @desc    Get all learning progress for the authenticated user
 * @route   GET /api/v1/quran-topics/progress
 * @access  Private (auth required)
 */
export const getProgress = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const progress = await getUserProgress(req.user);
    res.status(200).json({ success: true, progress });
  } catch (error) {
    logger.error("Error fetching user progress:", error);
    next(new AppError("Failed to fetch progress", 500));
  }
};

/**
 * @desc    Get learning progress for a specific topic
 * @route   GET /api/v1/quran-topics/topics/:slug/progress
 * @access  Private (auth required)
 */
export const getTopicProgressHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!req.user) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const progress = await getTopicProgress(req.user, slug);
    res.status(200).json({ success: true, progress });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error fetching progress for topic ${req.params.slug}:`, error);
    next(new AppError("Failed to fetch topic progress", 500));
  }
};

/**
 * @desc    Record a review session (creates or updates spaced repetition)
 * @route   POST /api/v1/quran-topics/topics/:slug/progress
 * @access  Private (auth required)
 * @body    { quality: 1-5 }
 */
export const recordProgressReview = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { quality } = req.body;
    const userId = req.user;

    if (!userId) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const progress = await recordReview(userId, slug, quality);
    res.status(200).json({ success: true, progress });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(`Error recording review for topic ${req.params.slug}:`, error);
    next(new AppError("Failed to record review", 500));
  }
};

/**
 * @desc    Get topics due for review (spaced repetition reminders)
 * @route   GET /api/v1/quran-topics/progress/due
 * @access  Private (auth required)
 */
export const getDueReviewsHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const dueReviews = await getDueReviews(req.user);
    res.status(200).json({ success: true, dueReviews });
  } catch (error) {
    logger.error("Error fetching due reviews:", error);
    next(new AppError("Failed to fetch due reviews", 500));
  }
};
