import mongoose from "mongoose";

/**
 * A *reference* node, not a text store.
 *
 * Identity is the canonical citation (collection + number) so the node is
 * source-independent; `hadeethencId` is an optional join to the app's existing
 * HadeethEnc-based hadith surface (postSchema.js:17-18). Sunnah.com prohibits
 * scraping and mass reproduction, so this stores a citation and a link, never
 * their text — see §3.5.
 */
const hadithRefSchema = new mongoose.Schema(
  {
    /** Canonical citation — the identity of the node */
    collection: {
      type: String,
      required: true,
      enum: [
        "bukhari",
        "muslim",
        "abudawud",
        "tirmidhi",
        "nasai",
        "ibnmajah",
        "ahmad",
        "other",
      ],
      index: true,
    },
    number: { type: String, required: true }, // string: "3953" or "1763a"
    /** Optional secondary ids — the repo's existing hadith identity is HadeethEnc (postSchema.js:17-18) */
    hadeethencId: { type: String, default: null, index: true, sparse: true },
    sunnahComUrl: { type: String, default: null },

    /**
     * Gradings are plural and attributed. The research is explicit that graders differ.
     * Never store a single unattributed "grade".
     */
    gradings: [
      {
        grade: {
          type: String,
          required: true,
          enum: ["sahih", "hasan", "daif", "mawdu", "mursal", "ungraded"],
        },
        // "al-Albani", "Darussalam", "Zubair Ali Zai", "Bukhari/Muslim (by inclusion)"
        grader: { type: String, required: true },
        source: { type: String, required: true }, // where the grading is recorded
      },
    ],

    /** Short English gloss of the matn, in your own words, for the card. Not the translation. */
    gloss: { type: String, required: true, maxlength: 500 },
    /** Arabic matn excerpt — only from a source whose terms permit it (see §3.5) */
    matnArabicExcerpt: { type: String, default: null, maxlength: 1000 },
  },
  {
    timestamps: true,
    /**
     * `collection` is a reserved Mongoose pathname, and the field is named that way
     * deliberately — it is half the node's natural key (collection + number) and part
     * of the API contract in §3.1, so renaming it would fork the spec.
     *
     * Verified safe before suppressing: on a document the path shadows the driver
     * accessor and `doc.collection` returns the string ("bukhari"), as do `get()`,
     * `toObject()` and `toJSON()`. Model-level operations use `Model.collection`, which
     * is untouched — the unique index below builds and enforces correctly.
     *
     * The one thing you cannot do is reach the driver handle via a *document*. No code
     * here does. If that ever changes, use `Model.collection` instead of renaming this.
     */
    suppressReservedKeysWarning: true,
  }
);

hadithRefSchema.index({ collection: 1, number: 1 }, { unique: true });

export const HadithRef = mongoose.model("HadithRef", hadithRefSchema);
