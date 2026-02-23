import mongoose from "mongoose";

const quranTopicAyahSchema = new mongoose.Schema(
  {
    // Quran reference
    surahNumber: { type: Number, required: true },
    ayahNumber: { type: Number, required: true },
    globalAyahNumber: { type: Number, required: true },

    // Text
    arabicText: { type: String, required: true },
    englishTranslation: { type: String, required: true },

    // Topic & mood tagging
    tags: { type: [String], index: true },
    category: { type: String, index: true },
    emotion: { type: String, index: true },

    // User-facing topic slugs this ayah belongs to
    topicSlugs: { type: [String], index: true },

    // Surah metadata
    surahName: String,
    surahNameArabic: String,
    revelationType: String,
  },
  { timestamps: true }
);

// Compound indexes for efficient topic/mood queries
quranTopicAyahSchema.index({ topicSlugs: 1, surahNumber: 1, ayahNumber: 1 });
quranTopicAyahSchema.index({ emotion: 1, surahNumber: 1 });
quranTopicAyahSchema.index({ tags: 1 });

export default mongoose.model("QuranTopicAyah", quranTopicAyahSchema);
