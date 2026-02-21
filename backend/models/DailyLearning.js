import mongoose from "mongoose";

const dailyLearningSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        learningType: {
            type: String,
            enum: ["ayah", "ruku", "juzz"],
            required: true,
        },
        referenceId: {
            type: String,
            required: true,
            // Format depends on learningType:
            // ayah → "2:186"   (surah:ayah)
            // ruku → "ruku-7"  (ruku number 1–556)
            // juzz → "juz-1"   (juzz number 1–30)
        },
        title: {
            type: String,
            // Short contextual title, e.g., "Finding true peace"
        },
        reflectionText: {
            type: String,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        isPrivate: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index for fast user + date queries
dailyLearningSchema.index({ userId: 1, createdAt: -1 });
dailyLearningSchema.index({ userId: 1, learningType: 1 });

export default mongoose.model("DailyLearning", dailyLearningSchema);
