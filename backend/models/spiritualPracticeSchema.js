import mongoose from "mongoose";

const spiritualPracticeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        practiceType: {
            type: String,
            enum: ["tafakkur", "tadabbur", "tazkia"],
            required: true,
            index: true,
        },

        // Content reference (what the user was working on)
        sourceRef: {
            type: String, // slug (tafakkur), ayahKey (tadabbur), trait-slug (tazkia)
            required: true,
        },
        sourceTitle: {
            type: String, // human-readable label
            required: true,
            maxlength: 500,
        },

        // The work the user did
        reflectionText: {
            type: String, // free-form entry
            maxlength: 10000,
        },
        guidedAnswers: [
            {
                prompt: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],

        // Tazkia-specific
        habitChecks: [
            {
                habit: { type: String, required: true },
                completed: { type: Boolean, default: false },
            },
        ],
        traitRating: {
            type: Number, // 1-5 self-assessment
            min: 1,
            max: 5,
        },

        // Cross-linking
        linkedSessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SpiritualSession", // Future phase
            default: null,
        },
        linkedPracticeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SpiritualPractice", // Cross-linking to another practice
            default: null,
        },

        // Privacy
        isPrivate: {
            type: Boolean,
            default: true,
        },
        sharedToFeed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Indexes for common queries
spiritualPracticeSchema.index({ userId: 1, practiceType: 1, createdAt: -1 });

export const SpiritualPractice = mongoose.model("SpiritualPractice", spiritualPracticeSchema);
