import mongoose from "mongoose";

/**
 * The edge. This is the whole product.
 *
 * Edges are first-class documents in their own collection, never arrays embedded
 * on a node — embedding makes edge-level review state, versioning and per-edge
 * indexes impossible (§2.3).
 */

const NODE_TYPES = ["ayah", "seerahEvent", "hadithRef", "tafsirPassage"];

const knowledgeLinkSchema = new mongoose.Schema(
  {
    // ── Endpoints ─────────────────────────────────────
    fromType: { type: String, enum: NODE_TYPES, required: true },
    /** ObjectId string for stored nodes; verse key ("8:9") when fromType === "ayah" */
    fromRef: { type: String, required: true },
    toType: { type: String, enum: NODE_TYPES, required: true },
    toRef: { type: String, required: true },

    /**
     * The verb is the honest label. "revealed_concerning" is a strong historical claim
     * that needs an asbab report. "thematically_related" is a curatorial claim. They are
     * not interchangeable and the UI renders them differently.
     */
    relation: {
      type: String,
      required: true,
      enum: [
        "revealed_concerning", // ayah → event, requires an asbab source
        "references", // ayah → event, the ayah names/describes the event
        "thematically_related", // ayah → event, curatorial, no sabab claim
        "attested_by", // event → hadithRef
        "explained_by", // ayah → tafsirPassage
        "dated_by", // event → hadithRef (the report is the dating evidence)
      ],
      index: true,
    },

    // ── Provenance (all REQUIRED — this is the visibility gate) ──
    source: {
      work: { type: String, required: true }, // "al-Wahidi, Asbab al-Nuzul"
      locator: { type: String, required: true }, // "on 8:9" / "vol. 2 p. 14"
      url: { type: String, default: null },
    },
    /** Authenticity of the *link's evidence*, not of the nodes */
    grading: {
      label: {
        type: String,
        required: true,
        enum: [
          "sahih",
          "hasan",
          "daif",
          "mursal",
          "no-isnad",
          "curatorial",
          "textual",
        ],
      },
      basis: { type: String, required: true, maxlength: 500 }, // why this label
    },
    confidence: {
      type: String,
      required: true,
      enum: ["established", "reported", "contested", "weak"],
    },
    disagreement: {
      flag: { type: Boolean, required: true },
      // what the disagreement is, neutrally
      summary: { type: String, default: "", maxlength: 1000 },
    },

    // ── Versioning ────────────────────────────────────
    version: { type: Number, default: 1, min: 1 },
    supersedes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeLink",
      default: null,
    },
    /** sha256 over the quoted material at authoring time (ayah text edition + excerpts) */
    snapshotHash: { type: String, required: true },
    snapshotNote: { type: String, default: "" }, // "alquran.cloud quran-uthmani / en.sahih"

    // ── Review state (DERIVED — written only by knowledgeReviewService) ──
    review: {
      state: {
        type: String,
        enum: [
          "draft",
          "unreviewed",
          "reviewed",
          "contested",
          "returned",
          "retired",
        ],
        default: "draft",
        index: true,
      },
      /**
       * Which reviewer domain governs this edge — derived from relation by
       * utils/knowledgeDomain.js.
       *
       * `curatorial` is a routing destination with no grantable counterpart:
       * User.reviewerProfile.domains deliberately omits it, so no reviewer can ever
       * hold it and an edge routed here can never accumulate an accept. It therefore
       * stays `unreviewed` permanently — the intended terminal state, not a gap.
       * `unreviewed` is publishable (§1.6) and the badge says exactly what it is,
       * rather than implying a review the claim does not admit of.
       */
      domain: {
        type: String,
        enum: [
          "hadith-grading",
          "asbab-al-nuzul",
          "seerah-chronology",
          "tafsir-attribution",
          "curatorial",
        ],
        required: true,
      },
      acceptCount: { type: Number, default: 0 },
      objectCount: { type: Number, default: 0 },
      lastDecisionAt: { type: Date, default: null },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One live edge per (from, to, relation, version)
knowledgeLinkSchema.index(
  {
    fromType: 1,
    fromRef: 1,
    toType: 1,
    toRef: 1,
    relation: 1,
    version: 1,
  },
  { unique: true }
);
// The two 1-hop reads
knowledgeLinkSchema.index({ fromType: 1, fromRef: 1, "review.state": 1 });
knowledgeLinkSchema.index({ toType: 1, toRef: 1, "review.state": 1 });
// Reviewer queue
knowledgeLinkSchema.index({
  "review.domain": 1,
  "review.state": 1,
  updatedAt: -1,
});

// Structural rule: "revealed_concerning" without an asbab-class source is not a valid edge.
knowledgeLinkSchema.pre("validate", function (next) {
  if (
    this.relation === "revealed_concerning" &&
    this.grading.label === "curatorial"
  ) {
    return next(
      new Error(
        '"revealed_concerning" requires transmitted evidence; use "thematically_related"'
      )
    );
  }
  next();
});

export const KnowledgeLink = mongoose.model(
  "KnowledgeLink",
  knowledgeLinkSchema
);
