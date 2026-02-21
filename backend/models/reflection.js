import mongoose from "mongoose";

const reflectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ayahKey: {
            type: String, // e.g. "2:186" (surah:ayah)
            required: true,
        },
        reflectionText: {
            type: String,
            required: true,
        },
        isPrivate: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Reflection", reflectionSchema);
