import {
  getSignOfTheDay,
  getSignsByCategory,
  getSignById as fetchSignById,
  getCategories as fetchCategories,
} from "../services/signService.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

const VALID_CATEGORIES = [
  "quran_science",
  "prophecy",
  "linguistic_miracle",
  "historical_fact",
  "prophetic_wisdom",
  "names_of_allah",
];

/**
 * @desc   Get the curated sign of the day
 * @route  GET /api/v1/signs/daily
 * @access Public
 */
export const getDailySign = async (req, res, next) => {
  try {
    const sign = await getSignOfTheDay();
    return res.status(200).json({ success: true, sign });
  } catch (error) {
    logger.error("Error fetching sign of the day:", error);
    next(error instanceof AppError ? error : new AppError("Failed to fetch sign of the day.", 500));
  }
};

/**
 * @desc   Get paginated list of published signs, optionally filtered by category
 * @route  GET /api/v1/signs?category=prophecy&page=1&limit=12
 * @access Public
 */
export const getSigns = async (req, res, next) => {
  try {
    const { category, page, limit } = req.query;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return next(
        new AppError(
          `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
          400
        )
      );
    }

    const result = await getSignsByCategory({ category, page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error("Error fetching signs:", error);
    next(error instanceof AppError ? error : new AppError("Failed to fetch signs.", 500));
  }
};

/**
 * @desc   Get a single sign by ID
 * @route  GET /api/v1/signs/:id
 * @access Public
 */
export const getSignById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Guard against malformed ObjectId before hitting MongoDB
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return next(new AppError("Invalid sign ID.", 400));
    }

    const sign = await fetchSignById(id);
    return res.status(200).json({ success: true, sign });
  } catch (error) {
    logger.error(`Error fetching sign ${req.params.id}:`, error);
    next(error instanceof AppError ? error : new AppError("Failed to fetch sign.", 500));
  }
};

/**
 * @desc   Get all categories with their published sign counts
 * @route  GET /api/v1/signs/categories
 * @access Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await fetchCategories();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    logger.error("Error fetching sign categories:", error);
    next(error instanceof AppError ? error : new AppError("Failed to fetch categories.", 500));
  }
};
