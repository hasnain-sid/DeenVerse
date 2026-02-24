import mongoose from "mongoose";

const VALID_CATEGORIES = [
  "quran_science",
  "prophecy",
  "linguistic_miracle",
  "historical_fact",
  "prophetic_wisdom",
  "names_of_allah",
];

const signSchema = new mongoose.Schema(
  {
    /**
     * Display title of the sign (e.g. "The Expanding Universe")
     */
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },

    /**
     * Content category slug
     */
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: VALID_CATEGORIES,
        message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      },
      index: true,
    },

    /**
     * Short summary shown on cards (≤ 280 chars)
     */
    summary: {
      type: String,
      required: [true, "Summary is required"],
      maxlength: [280, "Summary must be at most 280 characters"],
    },

    /**
     * Full multi-paragraph explanation (Markdown allowed)
     */
    explanation: {
      type: String,
      required: [true, "Explanation is required"],
    },

    /**
     * Arabic text of the Qur'anic verse or hadith (optional)
     */
    arabicText: {
      type: String,
      default: null,
    },

    /**
     * English translation of the Arabic text (optional)
     */
    translation: {
      type: String,
      default: null,
    },

    /**
     * Human-readable reference (e.g. "Quran 51:47" or "Sahih al-Bukhari 3176")
     */
    reference: {
      type: String,
      required: [true, "Reference is required"],
    },

    /**
     * External source URL (Yaqeen, Sunnah.com, academic paper, etc.)
     * Every sign MUST have a credible source link.
     */
    sourceUrl: {
      type: String,
      required: [true, "Source URL is required"],
    },

    /**
     * Hadith grade: only Sahih or Hasan permitted.
     * Null for Qur'anic verses / non-hadith entries.
     * Mongoose skips enum validation for null on non-required fields.
     */
    hadithGrade: {
      type: String,
      enum: {
        values: ["Sahih", "Hasan"],
        message: "Hadith grade must be Sahih or Hasan",
      },
      default: null,
    },

    /**
     * Display order within category (lower = shown first)
     */
    order: {
      type: Number,
      default: 0,
      index: true,
    },

    /**
     * Whether the sign is live / visible to users
     */
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Free-form tags for future search / recommendations
     */
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound indexes for the most common query patterns
signSchema.index({ category: 1, isPublished: 1, order: 1 });
signSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model("Sign", signSchema);
