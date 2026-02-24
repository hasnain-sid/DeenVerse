import mongoose from "mongoose";
import { SpiritualPractice } from "../models/spiritualPracticeSchema.js";
import { AppError } from "../utils/AppError.js";
import { tafakkurTopics } from "../data/tafakkurTopics.js";
import { tazkiaTraits } from "../data/tazkiaTraits.js";
import { tadabburAyahs } from "../data/tadabburAyahs.js";

const VALID_PRACTICE_TYPES = ["tafakkur", "tadabbur", "tazkia"];

/* ──────────────────────────────── Static content ────────────────────────────── */

export function getAllTafakkurTopics() {
    return tafakkurTopics;
}

export function getTodayTafakkurTopic() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const oneDay = 86_400_000; // 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay);
    return tafakkurTopics[dayOfYear % tafakkurTopics.length];
}

export function getTafakkurTopicBySlug(slug) {
    const topic = tafakkurTopics.find((t) => t.slug === slug);
    if (!topic) throw new AppError("Topic not found", 404);
    return topic;
}

export function getAllTazkiaTraits() {
    return tazkiaTraits;
}

export function getTazkiaTraitBySlug(slug) {
    const trait = tazkiaTraits.find((t) => t.slug === slug);
    if (!trait) throw new AppError("Trait not found", 404);
    return trait;
}

/* ──────────────────────────────── Tadabbur content ───────────────────────────── */

export function getAllTadabburAyahs() {
    return tadabburAyahs;
}

/**
 * Get today's rotating Tadabbur ayah.
 * Uses a different rotation offset so it doesn't always sync with Tafakkur.
 * @returns {object} single tadabbur ayah
 */
export function getTodayTadabburAyah() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const oneDay = 86_400_000;
    const dayOfYear = Math.floor(diff / oneDay);
    // Offset by 7 so it doesn't sync with Tafakkur's rotation
    return tadabburAyahs[(dayOfYear + 7) % tadabburAyahs.length];
}

/**
 * Get a single Tadabbur ayah by its verseKey.
 * @param {string} verseKey e.g. "7:57" or "55:19-20"
 * @returns {object}
 */
export function getTadabburAyahByVerseKey(verseKey) {
    const ayah = tadabburAyahs.find((a) => a.verseKey === verseKey);
    if (!ayah) throw new AppError("Tadabbur ayah not found", 404);
    return ayah;
}

/* ──────────────────────────────── Practice CRUD ─────────────────────────────── */

/**
 * Save a new spiritual practice.
 * @param {string} userId
 * @param {object} payload
 * @returns {Promise<object>} saved practice document
 */
export async function savePractice(userId, payload) {
    const {
        practiceType,
        sourceRef,
        sourceTitle,
        reflectionText,
        guidedAnswers,
        habitChecks,
        traitRating,
        isPrivate,
    } = payload;

    if (!practiceType || !sourceRef || !sourceTitle) {
        throw new AppError("practiceType, sourceRef, and sourceTitle are required", 400);
    }
    if (!VALID_PRACTICE_TYPES.includes(practiceType)) {
        throw new AppError(
            `Invalid practiceType. Must be one of: ${VALID_PRACTICE_TYPES.join(", ")}`,
            400
        );
    }
    if (reflectionText && reflectionText.length > 10_000) {
        throw new AppError("reflectionText must be 10,000 characters or less", 400);
    }
    if (guidedAnswers && guidedAnswers.length > 20) {
        throw new AppError("guidedAnswers must contain 20 entries or fewer", 400);
    }
    if (habitChecks && habitChecks.length > 50) {
        throw new AppError("habitChecks must contain 50 entries or fewer", 400);
    }
    if (traitRating !== undefined && (traitRating < 1 || traitRating > 5)) {
        throw new AppError("traitRating must be between 1 and 5", 400);
    }

    const doc = new SpiritualPractice({
        userId,
        practiceType,
        sourceRef,
        sourceTitle,
        reflectionText,
        guidedAnswers,
        habitChecks,
        traitRating,
        isPrivate: isPrivate !== undefined ? isPrivate : true,
    });

    return doc.save();
}

/**
 * Paginated, filterable list of a user's practices.
 * Used by both /practices and /journal endpoints (they were identical).
 * @param {string} userId
 * @param {{ type?: string, page?: number, limit?: number }} options
 */
export async function getPractices(userId, { type, page = 1, limit = 20 } = {}) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
        ? Math.min(100, Math.max(1, Math.floor(limit)))
        : 20;

    const filter = { userId };
    if (type && VALID_PRACTICE_TYPES.includes(type)) {
        filter.practiceType = type;
    }

    const skip = (safePage - 1) * safeLimit;

    const [practices, total] = await Promise.all([
        SpiritualPractice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        SpiritualPractice.countDocuments(filter),
    ]);

    return {
        practices,
        totalPages: Math.ceil(total / safeLimit),
        currentPage: safePage,
        totalEntries: total,
    };
}

/**
 * Get a single practice by its ID (scoped to user).
 * @param {string} userId
 * @param {string} practiceId
 */
export async function getPracticeById(userId, practiceId) {
    if (!mongoose.Types.ObjectId.isValid(practiceId)) {
        throw new AppError("Invalid practice ID", 400);
    }
    const practice = await SpiritualPractice.findOne({ _id: practiceId, userId });
    if (!practice) throw new AppError("Practice not found", 404);
    return practice;
}

/**
 * Aggregate practice counts by type.
 * @param {string} userId
 */
export async function getStats(userId) {
    const stats = await SpiritualPractice.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$practiceType", count: { $sum: 1 } } },
    ]);

    const formatted = { tafakkur: 0, tadabbur: 0, tazkia: 0, total: 0 };
    for (const s of stats) {
        formatted[s._id] = s.count;
        formatted.total += s.count;
    }
    return formatted;
}
