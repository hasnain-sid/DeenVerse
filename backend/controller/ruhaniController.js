import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";
import * as ruhaniService from "../services/ruhaniService.js";

/**
 * @desc    Get all Tafakkur topics
 * @route   GET /api/v1/ruhani/tafakkur/topics
 * @access  Public
 */
export const getTafakkurTopics = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getAllTafakkurTopics());
    } catch (error) {
        logger.error("Error fetching Tafakkur topics:", error);
        next(new AppError("Failed to fetch Tafakkur topics", 500));
    }
};

/**
 * @desc    Get today's Tafakkur topic (rotating)
 * @route   GET /api/v1/ruhani/tafakkur/today
 * @access  Public
 */
export const getTodayTafakkurTopic = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getTodayTafakkurTopic());
    } catch (error) {
        logger.error("Error fetching today's Tafakkur topic:", error);
        next(new AppError("Failed to fetch today's topic", 500));
    }
};

/**
 * @desc    Get a single Tafakkur topic by slug
 * @route   GET /api/v1/ruhani/tafakkur/topic/:slug
 * @access  Public
 */
export const getTafakkurTopicBySlug = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getTafakkurTopicBySlug(req.params.slug));
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error fetching Tafakkur topic by slug:", error);
        next(new AppError("Failed to fetch topic", 500));
    }
};

/**
 * @desc    Get all Tazkia traits
 * @route   GET /api/v1/ruhani/tazkia/traits
 * @access  Public
 */
export const getTazkiaTraits = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getAllTazkiaTraits());
    } catch (error) {
        logger.error("Error fetching Tazkia traits:", error);
        next(new AppError("Failed to fetch Tazkia traits", 500));
    }
};

/**
 * @desc    Get a single Tazkia trait by slug
 * @route   GET /api/v1/ruhani/tazkia/trait/:slug
 * @access  Public
 */
export const getTazkiaTraitBySlug = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getTazkiaTraitBySlug(req.params.slug));
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error fetching Tazkia trait by slug:", error);
        next(new AppError("Failed to fetch trait", 500));
    }
};

/**
 * @desc    Get all Tadabbur ayahs
 * @route   GET /api/v1/ruhani/tadabbur/ayahs
 * @access  Public
 */
export const getTadabburAyahs = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getAllTadabburAyahs());
    } catch (error) {
        logger.error("Error fetching Tadabbur ayahs:", error);
        next(new AppError("Failed to fetch Tadabbur ayahs", 500));
    }
};

/**
 * @desc    Get today's Tadabbur ayah (rotating)
 * @route   GET /api/v1/ruhani/tadabbur/today
 * @access  Public
 */
export const getTodayTadabburAyah = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getTodayTadabburAyah());
    } catch (error) {
        logger.error("Error fetching today's Tadabbur ayah:", error);
        next(new AppError("Failed to fetch today's ayah", 500));
    }
};

/**
 * @desc    Get a single Tadabbur ayah by verseKey
 * @route   GET /api/v1/ruhani/tadabbur/ayah/:verseKey
 * @access  Public
 */
export const getTadabburAyahByVerseKey = (req, res, next) => {
    try {
        res.status(200).json(ruhaniService.getTadabburAyahByVerseKey(req.params.verseKey));
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error fetching Tadabbur ayah by verseKey:", error);
        next(new AppError("Failed to fetch ayah", 500));
    }
};

/**
 * @desc    Save a spiritual practice (Tafakkur, Tadabbur, Tazkia)
 * @route   POST /api/v1/ruhani/practice
 * @access  Private
 */
export const saveSpiritualPractice = async (req, res, next) => {
    try {
        const saved = await ruhaniService.savePractice(req.user, req.body);
        res.status(201).json(saved);
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error saving spiritual practice:", error);
        next(new AppError("Failed to save spiritual practice", 500));
    }
};

/**
 * @desc    Get user's practices (paginated, filterable by type)
 * @route   GET /api/v1/ruhani/practices
 * @access  Private
 */
export const getUserPractices = async (req, res, next) => {
    try {
        const { type, limit = 20, page = 1, q } = req.query;
        const result = await ruhaniService.getPractices(req.user, {
            type,
            q,
            page: Number(page),
            limit: Number(limit),
        });
        res.status(200).json(result);
    } catch (error) {
        logger.error("Error fetching user practices:", error);
        next(new AppError("Failed to fetch practices", 500));
    }
};

/**
 * @desc    Get a single practice by ID
 * @route   GET /api/v1/ruhani/practices/:id
 * @access  Private
 */
export const getPracticeById = async (req, res, next) => {
    try {
        const practice = await ruhaniService.getPracticeById(req.user, req.params.id);
        res.status(200).json(practice);
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error fetching practice by ID:", error);
        next(new AppError("Failed to fetch practice", 500));
    }
};

/**
 * @desc    Update a practice's reflection content
 * @route   PATCH /api/v1/ruhani/practices/:id
 * @access  Private
 */
export const updatePractice = async (req, res, next) => {
    try {
        const updated = await ruhaniService.updatePractice(req.user, req.params.id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error updating practice:", error);
        next(new AppError("Failed to update practice", 500));
    }
};

/**
 * @desc    Permanently delete a practice
 * @route   DELETE /api/v1/ruhani/practices/:id
 * @access  Private
 */
export const deletePractice = async (req, res, next) => {
    try {
        const result = await ruhaniService.deletePractice(req.user, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error("Error deleting practice:", error);
        next(new AppError("Failed to delete practice", 500));
    }
};

/**
 * @desc    Get user's spiritual practices (journal) — alias for getUserPractices
 * @route   GET /api/v1/ruhani/journal
 * @access  Private
 */
export const getJournal = getUserPractices;

/**
 * @desc    Export the user's entire journal as a downloadable file
 * @route   GET /api/v1/ruhani/journal/export
 * @access  Private
 */
export const exportJournal = async (req, res, next) => {
    try {
        const data = await ruhaniService.exportJournal(req.user);
        const filename = `ruhani-journal-${new Date().toISOString().slice(0, 10)}.json`;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(JSON.stringify(data, null, 2));
    } catch (error) {
        logger.error("Error exporting journal:", error);
        next(new AppError("Failed to export journal", 500));
    }
};

/**
 * @desc    Get user's spiritual practice stats
 * @route   GET /api/v1/ruhani/stats
 * @access  Private
 */
export const getStats = async (req, res, next) => {
    try {
        const stats = await ruhaniService.getStats(req.user);
        res.status(200).json(stats);
    } catch (error) {
        logger.error("Error fetching Ruhani stats:", error);
        next(new AppError("Failed to fetch stats", 500));
    }
};
