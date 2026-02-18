import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "reply", "follow", "repost", "mention", "system"],
      required: true,
    },
    // Reference post for like/reply/repost/mention notifications
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index: fetch user's notifications sorted by date
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Quick count of unread
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
