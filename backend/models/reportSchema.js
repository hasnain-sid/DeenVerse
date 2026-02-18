import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // What is being reported
    targetType: {
      type: String,
      enum: ["post", "user", "message", "stream"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    // Dynamic ref based on targetType
    targetModel: {
      type: String,
      enum: ["Post", "User", "Message", "Stream"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "inappropriate",
        "misinformation",
        "harassment",
        "hate_speech",
        "violence",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    // Admin who handled the report
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolution: {
      type: String,
      enum: ["no_action", "warn", "mute_24h", "mute_7d", "ban", "content_removed"],
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reports from same user on same target
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model("Report", reportSchema);
