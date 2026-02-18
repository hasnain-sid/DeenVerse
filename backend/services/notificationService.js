import { Notification } from "../models/notificationSchema.js";
import { AppError } from "../utils/AppError.js";

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
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "follow",
    });
  }
}
