import mongoose from "mongoose";

/**
 * A citation plus your own summary — never a copy of the passage.
 *
 * `arabicExcerpt` stays null for anything sourced from a restricted origin
 * (altafsir.com, the scraped Guezzou translation of al-Wahidi). `summary` is
 * required because it is the only text the platform owns — see §3.5.
 */
const tafsirPassageSchema = new mongoose.Schema(
  {
    work: {
      type: String,
      required: true,
      enum: [
        "ibn-kathir",
        "tabari",
        "qurtubi",
        "jalalayn",
        "saadi",
        "wahidi-asbab",
        "suyuti-lubab",
        "other",
      ],
      index: true,
    },
    verseKey: {
      type: String,
      required: true,
      match: /^\d{1,3}:\d{1,3}$/,
      index: true,
    },
    /** Locator inside the work — volume/page or edition-specific anchor */
    locator: { type: String, required: true },
    /** Your summary of what the passage says about this ayah. Original prose. */
    summary: { type: String, required: true, maxlength: 1500 },
    /** Where a reader can consult the passage. A link, not a copy. */
    externalUrl: { type: String, default: null },
    /** Arabic excerpt only when licence permits; null otherwise (see §3.5) */
    arabicExcerpt: { type: String, default: null, maxlength: 1500 },
  },
  { timestamps: true }
);

tafsirPassageSchema.index({ work: 1, verseKey: 1 }, { unique: true });

export const TafsirPassage = mongoose.model("TafsirPassage", tafsirPassageSchema);
