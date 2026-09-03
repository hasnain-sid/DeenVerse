import mongoose from "mongoose";
import slugify from "slugify";

const seerahEventSchema = new mongoose.Schema(
  {
    /** URL-safe id, auto-generated from title (see courseSchema.js:132-147 for the pattern) */
    slug: { type: String, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    titleArabic: { type: String, default: "" },

    /** Segment grouping — v1 has exactly one value */
    segment: { type: String, enum: ["badr"], required: true, index: true },

    /**
     * Dating is plural on purpose. Sources disagree on day/month; store each
     * attested dating with its source. Never collapse to one field.
     */
    dating: [
      {
        source: { type: String, required: true }, // e.g. "Ibn Hisham, Sira 1/606"
        hijriYear: { type: Number, required: true },
        hijriMonth: { type: Number, min: 1, max: 12 },
        hijriDay: { type: Number, min: 1, max: 30 },
        note: { type: String, default: "" },
      },
    ],

    /** Ordering within the segment for narrative display (curatorial, not a historical claim) */
    narrativeOrder: { type: Number, required: true },

    /**
     * Your own summary. Must be original prose — never pasted from a copyrighted
     * Seerah translation (see §3.5 licensing).
     */
    summary: { type: String, required: true, maxlength: 2000 },

    /** People/places as plain labels in v1 — no Person/Place nodes yet (Task 4) */
    participants: [{ type: String, maxlength: 120 }],
    places: [{ type: String, maxlength: 120 }],

    /** Light node-level review: is this a real, defensibly-summarised event */
    review: {
      state: {
        type: String,
        enum: ["draft", "unreviewed", "reviewed", "retired"],
        default: "draft",
        index: true,
      },
      snapshotHash: { type: String, default: null }, // sha256 of summary at last review
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving (mirrors courseSchema.js:132-147)
seerahEventSchema.pre("save", async function (next) {
  /**
   * An explicitly supplied slug wins on creation.
   *
   * Curated events carry short, stable ids that deliberately differ from the title —
   * "spoils-dispute" for "Dispute over the Badr spoils" — and those ids are the natural
   * key links resolve against and the segment they appear under in public URLs (§3.4).
   * Deriving over the top of them would break both. Uniqueness is still enforced by the
   * unique index below.
   */
  if (this.isNew && this.slug) return next();

  if (!this.isModified("title")) return next();

  const baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (
    await mongoose.models.SeerahEvent.exists({ slug, _id: { $ne: this._id } })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

seerahEventSchema.index({ slug: 1 }, { unique: true });
seerahEventSchema.index({ segment: 1, narrativeOrder: 1 });

export const SeerahEvent = mongoose.model("SeerahEvent", seerahEventSchema);
