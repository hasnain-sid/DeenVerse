import {
  listTopics,
  listCategories,
  listMoods,
  getTopicAyahs,
  getMoodAyahs,
  searchQuranByKeyword,
} from "../services/topicService.js";
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
