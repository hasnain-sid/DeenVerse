import mongoose from "mongoose";
import { SpiritualPractice } from "../models/spiritualPracticeSchema.js";
import { AppError } from "../utils/AppError.js";
import { tafakkurTopics } from "../data/tafakkurTopics.js";
import { tazkiaTraits } from "../data/tazkiaTraits.js";
import { tadabburAyahs } from "../data/tadabburAyahs.js";

const VALID_PRACTICE_TYPES = ["tafakkur", "tadabbur", "tazkia"];

/** Neutralises regex metacharacters so a search term stays a literal string. */
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
        linkedPracticeId,
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

    // Chains one practice to the previous step of a spiral (Tafakkur → Tadabbur → Tazkia).
    // Verified to belong to this user so a client cannot link into someone else's record.
    let verifiedLink = null;
    if (linkedPracticeId) {
        if (!mongoose.Types.ObjectId.isValid(linkedPracticeId)) {
            throw new AppError("Invalid linkedPracticeId", 400);
        }
        const exists = await SpiritualPractice.exists({ _id: linkedPracticeId, userId });
        if (exists) verifiedLink = linkedPracticeId;
        // A stale or foreign link is dropped rather than failing the save — the
        // user's reflection matters more than the chain metadata.
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
        linkedPracticeId: verifiedLink,
    });

    return doc.save();
}

/**
 * Paginated, filterable list of a user's practices.
 * Used by both /practices and /journal endpoints (they were identical).
 * @param {string} userId
 * @param {{ type?: string, page?: number, limit?: number }} options
 */
export async function getPractices(userId, { type, page = 1, limit = 20, q } = {}) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
        ? Math.min(100, Math.max(1, Math.floor(limit)))
        : 20;

    const filter = { userId };
    if (type && VALID_PRACTICE_TYPES.includes(type)) {
        filter.practiceType = type;
    }

    // Search is applied inside the userId-scoped filter — never as a post-filter —
    // so one user's journal can never surface in another's results.
    const term = typeof q === "string" ? q.trim() : "";
    if (term) {
        const safe = escapeRegex(term.slice(0, 100));
        const rx = new RegExp(safe, "i");
        filter.$or = [
            { reflectionText: rx },
            { sourceTitle: rx },
            { "guidedAnswers.answer": rx },
        ];
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
 * Update a practice's reflection content.
 *
 * Only the user's own work is editable. `practiceType`, `sourceRef`, and
 * `sourceTitle` identify what was being contemplated and are deliberately
 * immutable — rewriting them would detach the entry from its source.
 *
 * @param {string} userId
 * @param {string} practiceId
 * @param {object} payload
 * @returns {Promise<object>} the updated practice
 */
export async function updatePractice(userId, practiceId, payload) {
    if (!mongoose.Types.ObjectId.isValid(practiceId)) {
        throw new AppError("Invalid practice ID", 400);
    }

    const { reflectionText, guidedAnswers, habitChecks, traitRating, isPrivate } = payload;

    const updates = {};
    if (reflectionText !== undefined) {
        if (reflectionText.length > 10_000) {
            throw new AppError("reflectionText must be 10,000 characters or less", 400);
        }
        updates.reflectionText = reflectionText;
    }
    if (guidedAnswers !== undefined) {
        if (guidedAnswers.length > 20) {
            throw new AppError("guidedAnswers must contain 20 entries or fewer", 400);
        }
        updates.guidedAnswers = guidedAnswers;
    }
    if (habitChecks !== undefined) {
        if (habitChecks.length > 50) {
            throw new AppError("habitChecks must contain 50 entries or fewer", 400);
        }
        updates.habitChecks = habitChecks;
    }
    if (traitRating !== undefined) {
        if (traitRating < 1 || traitRating > 5) {
            throw new AppError("traitRating must be between 1 and 5", 400);
        }
        updates.traitRating = traitRating;
    }
    if (isPrivate !== undefined) {
        updates.isPrivate = isPrivate;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError("No editable fields provided", 400);
    }

    // Scoping the query by userId is what enforces ownership — never look up by _id alone.
    const updated = await SpiritualPractice.findOneAndUpdate(
        { _id: practiceId, userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updated) throw new AppError("Practice not found", 404);
    return updated;
}

/**
 * Permanently delete one of the user's practices.
 *
 * This is a hard delete by design: the journal holds private muhasaba, and a
 * user who asks for a confession to be erased should have it erased, not
 * soft-flagged.
 *
 * @param {string} userId
 * @param {string} practiceId
 */
export async function deletePractice(userId, practiceId) {
    if (!mongoose.Types.ObjectId.isValid(practiceId)) {
        throw new AppError("Invalid practice ID", 400);
    }

    const deleted = await SpiritualPractice.findOneAndDelete({ _id: practiceId, userId });
    if (!deleted) throw new AppError("Practice not found", 404);

    return { deleted: true, id: practiceId };
}

/**
 * Every practice the user has written, for export.
 * Unpaginated and lean — this is the user taking their own record with them.
 *
 * @param {string} userId
 */
export async function exportJournal(userId) {
    const practices = await SpiritualPractice.find({ userId })
        .sort({ createdAt: 1 })
        .select("-__v -userId")
        .lean();

    return {
        exportedAt: new Date().toISOString(),
        totalEntries: practices.length,
        practices,
    };
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
