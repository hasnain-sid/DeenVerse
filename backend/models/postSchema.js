import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    // Optional reference to an external hadith (HadeethEnc ID)
    hadithRef: {
      type: String,
      default: null,
    },
    // Structured shared payload (used by card shares like ayah/hadith/juzz/mood)
    sharedContent: {
      kind: {
        type: String,
        enum: ["hadith", "ayah", "ruku", "juzz", "mood", "sign"],
      },
      title: { type: String },
      sourceRef: { type: String },
      sourceRoute: { type: String },
      excerpt: { type: String },
      arabic: { type: String },
      translation: { type: String },
      meta: { type: [String], default: [] },
    },
    // How many times this post's content was re-shared
    shareCount: { type: Number, default: 0 },
    // Image URLs (max 4) — local paths or S3 URLs
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 4,
        message: "A post can have a maximum of 4 images",
      },
    },
    // Users who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Users who reposted this post
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // If this post is a reply, reference the parent
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
      index: true,
    },
    // Denormalized counts for fast queries
    replyCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    repostCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // Parsed hashtags for indexing/search
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for feed queries
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });
postSchema.index({ "sharedContent.kind": 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
