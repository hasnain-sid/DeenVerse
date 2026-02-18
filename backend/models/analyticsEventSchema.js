import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
      enum: [
        // Page views
        "page_view",
        // Content
        "hadith_view",
        "hadith_share",
        "hadith_save",
        "post_create",
        "post_like",
        "post_repost",
        "post_view",
        // Social
        "follow",
        "unfollow",
        "message_send",
        // Streams
        "stream_view",
        "stream_start",
        "stream_end",
        // Auth
        "register",
        "login",
        "logout",
        // Search
        "search",
      ],
    },
    // Additional context for the event
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // For page_view events
    page: {
      type: String,
      default: null,
    },
    // Session tracking
    sessionId: {
      type: String,
      default: null,
    },
    // User agent / device info
    userAgent: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Time-based queries
analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });
// User activity timeline
analyticsEventSchema.index({ user: 1, createdAt: -1 });

export const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);
