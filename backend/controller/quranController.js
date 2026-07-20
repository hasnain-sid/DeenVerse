import { getAyah, getRuku, getJuz, getSurahList, findAyahIdBySurah } from "../services/quranService.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/**
 * @desc    Static index of all 114 surahs (names, ayah counts, first global ayah id)
 * @route   GET /api/v1/quran/surahs
 * @access  Public
 */
export const getSurahs = (_req, res) => {
    res.status(200).json({ success: true, surahs: getSurahList() });
};

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
        res.status(200).json({ success: true, ...ayah });
    } catch (error) {
        logger.error("Error fetching ayah:", error);
        next(new AppError("Failed to fetch ayah", 500));
    }
};

/**
 * @desc    Fetch a single ayah by "surah:ayah" key (e.g. "7:57")
 * @route   GET /api/v1/quran/ayah/by-key/:verseKey
 * @access  Public
 *
 * Lets callers that think in verse references — the Quran reader, Ruhani
 * Tadabbur — resolve an ayah without first converting to a global 1–6236 id.
 */
export const getAyahByVerseKey = async (req, res, next) => {
    try {
        const match = /^(\d{1,3}):(\d{1,3})$/.exec(req.params.verseKey ?? "");
        if (!match) {
            return next(new AppError('verseKey must look like "surah:ayah", e.g. 7:57', 400));
        }

        const surah = parseInt(match[1], 10);
        const ayah = parseInt(match[2], 10);
        if (surah < 1 || surah > 114) {
            return next(new AppError("Surah must be between 1 and 114", 400));
        }

        let globalAyahNumber;
        try {
            globalAyahNumber = findAyahIdBySurah(surah, ayah);
        } catch {
            return next(new AppError(`Surah ${surah} has no ayah ${ayah}`, 400));
        }
        if (!globalAyahNumber || globalAyahNumber < 1 || globalAyahNumber > 6236) {
            return next(new AppError(`Surah ${surah} has no ayah ${ayah}`, 400));
        }

        const result = await getAyah(globalAyahNumber);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error("Error fetching ayah by verse key:", error);
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
        res.status(200).json({ success: true, ...ruku });
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
        res.status(200).json({ success: true, ...juz });
    } catch (error) {
        logger.error("Error fetching juzz:", error);
        next(new AppError("Failed to fetch juzz", 500));
    }
};
