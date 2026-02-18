import { Notification } from "../models/notificationSchema.js";
import { AppError } from "../utils/AppError.js";
import { pushNotification } from "./pushService.js";

/**
 * Emit a real-time notification via Socket.IO and send a web push.
 * Gracefully no-ops if socket isn't initialised.
 */
async function emitNotification(recipientId, notification) {
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();

    // Populate sender info for the notification payload
    const populated = await Notification.findById(notification._id)
      .populate("sender", "name username avatar")
      .populate("post", "content")
      .lean();

    io.to(`user:${recipientId}`).emit("notification:new", populated);

    // Send web push notification (fire-and-forget)
    pushNotification(populated).catch(() => {});
  } catch {
    // Socket not initialised or other error — skip silently
  }
}

/**
 * Get notifications for a user (paginated, newest first).
 */
export async function getNotifications(userId, { page = 1, limit = 30 }) {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name username avatar")
    .populate("post", "content")
    .lean();

  const total = await Notification.countDocuments({ recipient: userId });

  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get count of unread notifications.
 */
export async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });
  return count;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError("Notification not found", 404);
  return notification;
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
  return { modifiedCount: result.modifiedCount };
}

/**
 * Create a follow notification.
 */
export async function createFollowNotification(recipientId, senderId) {
  // Avoid duplicate follow notifications within 24 hours
  const existing = await Notification.findOne({
    recipient: recipientId,
    sender: senderId,
    type: "follow",
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (!existing) {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "follow",
    });
    await emitNotification(recipientId, notification);
  }
}

/**
 * Create a generic notification and emit it in real-time.
 * Used by other services (post likes, replies, mentions, reposts).
 */
export async function createAndEmitNotification({ recipientId, senderId, type, postId }) {
  if (recipientId === senderId) return; // Don't notify yourself

  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    post: postId || null,
  });

  await emitNotification(recipientId, notification);
  return notification;
}
