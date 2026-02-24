import mongoose from "mongoose";

const topicReflectionSchema = new mongoose.Schema(
  {
    /** Topic slug this reflection belongs to (e.g. "riba-interest") */
    topicSlug: {
      type: String,
      required: true,
      index: true,
    },
    /** Author of the reflection */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Reflection content (max 2000 chars) */
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    /** Users who liked this reflection */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    /** Denormalized like count for fast queries */
    likeCount: {
      type: Number,
      default: 0,
    },
    /** Scholar verification fields */
    isScholarVerified: {
      type: Boolean,
      default: false,
    },
    scholarName: {
      type: String,
      default: null,
    },
    scholarNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fetching reflections for a topic sorted by newest
topicReflectionSchema.index({ topicSlug: 1, createdAt: -1 });

// Prevent a user from spamming — optional compound unique if needed
topicReflectionSchema.index({ topicSlug: 1, userId: 1, createdAt: -1 });

export const TopicReflection = mongoose.model(
  "TopicReflection",
  topicReflectionSchema
);
