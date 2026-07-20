import mongoose from "mongoose";

/**
 * A guided Ruhani session — one pass through the Tafakkur → Tadabbur → Tazkia
 * spiral, orchestrated for the user rather than assembled by them.
 *
 * The session record is metadata only. The user's actual writing lives in the
 * three SpiritualPractice documents it points at, so a deleted session never
 * takes reflections with it.
 */
const spiritualSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        /** Minutes the user set aside; null for open-ended. */
        duration: {
            type: Number,
            min: 1,
            max: 240,
            default: null,
        },

        status: {
            type: String,
            enum: ["in-progress", "completed", "abandoned"],
            default: "in-progress",
            index: true,
        },

        // The content this session was built from, captured at start so the
        // session stays readable even if curated content is later reordered.
        topicSlug: { type: String, maxlength: 200 },
        verseKey: { type: String, maxlength: 20 },
        traitSlug: { type: String, maxlength: 200 },

        // Filled in as each step is completed
        tafakkurPracticeId: { type: mongoose.Schema.Types.ObjectId, ref: "SpiritualPractice", default: null },
        tadabburPracticeId: { type: mongoose.Schema.Types.ObjectId, ref: "SpiritualPractice", default: null },
        tazkiaPracticeId: { type: mongoose.Schema.Types.ObjectId, ref: "SpiritualPractice", default: null },

        /** The one thing the user committed to doing. */
        sessionAction: { type: String, maxlength: 2000 },

        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Listing a user's sessions newest-first is the only read pattern so far
spiritualSessionSchema.index({ userId: 1, createdAt: -1 });

export const SpiritualSession = mongoose.model("SpiritualSession", spiritualSessionSchema);
