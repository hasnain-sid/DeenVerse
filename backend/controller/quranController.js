import { getAyah, getRuku, getJuz } from "../services/quranService.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/**
 * @desc    Fetch a single ayah by global number
 * @route   GET /api/v1/quran/ayah/:number
 * @access  Public
 */
export const getAyahByNumber = async (req, res, next) => {
    try {
        const num = parseInt(req.params.number, 10);
        if (isNaN(num) || num < 1 || num > 6236) {
            return next(new AppError("Ayah number must be between 1 and 6236", 400));
        }

        const ayah = await getAyah(num);
        res.status(200).json(ayah);
    } catch (error) {
        logger.error("Error fetching ayah:", error);
        next(new AppError("Failed to fetch ayah", 500));
    }
};

/**
 * @desc    Fetch a complete ruku by number
 * @route   GET /api/v1/quran/ruku/:number
 * @access  Public
 */
export const getRukuByNumber = async (req, res, next) => {
    try {
        const num = parseInt(req.params.number, 10);
        if (isNaN(num) || num < 1 || num > 556) {
            return next(new AppError("Ruku number must be between 1 and 556", 400));
        }

        const ruku = await getRuku(num);
        res.status(200).json(ruku);
    } catch (error) {
        logger.error("Error fetching ruku:", error);
        next(new AppError("Failed to fetch ruku", 500));
    }
};

/**
 * @desc    Fetch a complete juzz by number
 * @route   GET /api/v1/quran/juz/:number
 * @access  Public
 */
export const getJuzByNumber = async (req, res, next) => {
    try {
        const num = parseInt(req.params.number, 10);
        if (isNaN(num) || num < 1 || num > 30) {
            return next(new AppError("Juzz number must be between 1 and 30", 400));
        }

        const juz = await getJuz(num);
        res.status(200).json(juz);
    } catch (error) {
        logger.error("Error fetching juzz:", error);
        next(new AppError("Failed to fetch juzz", 500));
    }
};
