import DailyLearning from "../models/DailyLearning.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";
import { getTodayIndex, getAyah, getRuku, getJuz } from "../services/quranService.js";
import { getActionItem } from "../services/actionItemService.js";

/**
 * @desc    Get daily learning content based on the learning type
 * @route   GET /api/v1/daily-learning?type=ayah
 * @access  Public
 */
export const getDailyLearningContent = async (req, res, next) => {
    try {
        const type = req.query.type || "ayah";
        const validTypes = ["ayah", "ruku", "juzz"];

        if (!validTypes.includes(type)) {
            return next(new AppError(
                `Invalid learning type. Must be one of: ${validTypes.join(", ")}`,
                400
            ));
        }

        const todayIndex = getTodayIndex(type);

        let content;
        if (type === "ayah") {
            content = await getAyah(todayIndex);
        } else if (type === "ruku") {
            content = await getRuku(todayIndex);
        } else {
            content = await getJuz(todayIndex);
        }

        // Generate a contextual action item from the verse's theme
        const actionData = getActionItem(content.translation, todayIndex);

        res.status(200).json({
            type,
            ...content,
            title: actionData.title,
            context: actionData.context,
            actionItem: actionData.actionItem,
            theme: actionData.theme,
        });
    } catch (error) {
        logger.error("Error fetching daily learning content:", error);
        next(new AppError("Failed to fetch daily learning content", 500));
    }
};

/**
 * @desc    Save a user reflection for daily learning
 * @route   POST /api/v1/daily-learning/reflection
 * @access  Private (requires auth)
 */
export const saveUserReflection = async (req, res, next) => {
    try {
        const { learningType, referenceId, reflectionText, isPrivate, title } = req.body;
        const userId = req.user; // Set by isAuthenticated middleware

        if (!learningType || !referenceId || !reflectionText) {
            return next(new AppError(
                "Missing required fields: learningType, referenceId, reflectionText",
                400
            ));
        }

        const validTypes = ["ayah", "ruku", "juzz"];
        if (!validTypes.includes(learningType)) {
            return next(new AppError(
                `Invalid learning type. Must be one of: ${validTypes.join(", ")}`,
                400
            ));
        }

        const newReflection = new DailyLearning({
            userId,
            learningType,
            referenceId,
            title,
            reflectionText,
            isPrivate: isPrivate !== undefined ? isPrivate : true,
            isCompleted: true,
        });

        const savedReflection = await newReflection.save();
        res.status(201).json(savedReflection);
    } catch (error) {
        logger.error("Error saving daily learning reflection:", error);
        next(new AppError("Failed to save reflection", 500));
    }
};

/**
 * @desc    Get past daily learning reflections for the authenticated user
 * @route   GET /api/v1/daily-learning/reflections?type=ayah
 * @access  Private (requires auth)
 */
export const getUserLearningHistory = async (req, res, next) => {
    try {
        const userId = req.user;
        const { type } = req.query;

        const filter = { userId };
        if (type) {
            filter.learningType = type;
        }

        const reflections = await DailyLearning.find(filter).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(reflections);
    } catch (error) {
        logger.error("Error fetching learning history:", error);
        next(new AppError("Failed to fetch learning history", 500));
    }
};
