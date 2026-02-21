import Reflection from '../models/reflection.js';
import { AppError } from '../utils/AppError.js';
import logger from '../config/logger.js';

// Seeded static ayahs for the mock/MVP or fetch from external API later.
const dailyAyahs = [
    {
        key: "2:186",
        arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
        translation: "And when My servants ask you concerning Me, indeed I am near.",
        surah: "Al-Baqarah",
        theme: "Dua & Hope",
        prompt: "What is one worry you have today that you can immediately hand over to Allah in a short dua?",
    },
    {
        key: "94:6",
        arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        translation: "Indeed, with hardship [will be] ease.",
        surah: "Ash-Sharh",
        theme: "Patience & Relief",
        prompt: "What hardship are you currently facing, and what 'ease' can you spot within it today?",
    },
    {
        key: "11:115",
        arabic: "وَٱصْبِرْ فَإِنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ",
        translation: "And be patient, for indeed, Allah does not allow to be lost the reward of those who do good.",
        surah: "Hud",
        theme: "Perseverance",
        prompt: "Where in your life are you struggling to be patient right now?",
    }
];

// Pick one based on day of year (simple rotation)
export const getDailyAyah = async (req, res, next) => {
    try {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

        const ayahIndex = dayOfYear % dailyAyahs.length;
        const selectedAyah = dailyAyahs[ayahIndex];

        res.status(200).json(selectedAyah);
    } catch (error) {
        logger.error("Error fetching daily ayah:", error);
        next(new AppError("Failed to fetch daily ayah", 500));
    }
};

export const saveReflection = async (req, res, next) => {
    try {
        const { ayahKey, reflectionText, isPrivate } = req.body;
        const userId = req.user; // Set by isAuthenticated middleware

        if (!ayahKey || !reflectionText) {
            return next(new AppError("Missing required fields: ayahKey, reflectionText", 400));
        }

        const newReflection = new Reflection({
            userId,
            ayahKey,
            reflectionText,
            isPrivate: isPrivate !== undefined ? isPrivate : true,
        });

        const savedReflection = await newReflection.save();
        res.status(201).json(savedReflection);

    } catch (error) {
        logger.error("Error saving reflection:", error);
        next(new AppError("Failed to save reflection", 500));
    }
};

export const getUserReflections = async (req, res, next) => {
    try {
        const userId = req.user;

        // Fetch all reflections for the user, newest first
        const reflections = await Reflection.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(reflections);
    } catch (error) {
        logger.error("Error fetching reflections:", error);
        next(new AppError("Failed to fetch reflections", 500));
    }
};
