import { Conversation } from "../models/conversationSchema.js";
import { Message } from "../models/messageSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get or create a conversation between two users.
 */
export async function getOrCreateConversation(userId, otherUserId) {
  if (userId === otherUserId) {
    throw new AppError("Cannot start a conversation with yourself", 400);
  }

  // Check other user exists
  const otherUser = await User.findById(otherUserId).select("_id");
  if (!otherUser) throw new AppError("User not found", 404);

  // Sort participant IDs for consistent lookup
  const participants = [userId, otherUserId].sort();

  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants });
  }

  return conversation;
}

/**
 * List conversations for a user (sorted by latest message).
 */
export async function getUserConversations(userId, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("participants", "name username avatar")
    .populate("lastMessage")
    .lean();

  const total = await Conversation.countDocuments({ participants: userId });

  // For each conversation, count unread messages
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        read: false,
      });
      return { ...conv, unreadCount };
    })
  );

  return {
    conversations: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get messages for a conversation (paginated, newest first).
 */
export async function getMessages(conversationId, userId, { page = 1, limit = 50 }) {
  // Verify user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) {
    throw new AppError("Conversation not found or access denied", 404);
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name username avatar")
    .lean();

  const total = await Message.countDocuments({ conversation: conversationId });

  // Mark messages from other user as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { read: true }
  );

  return {
    messages: messages.reverse(), // Return in chronological order
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(conversationId, senderId, content) {
  if (!content || content.trim().length === 0) {
    throw new AppError("Message content is required", 400);
  }

  // Verify sender is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });
  if (!conversation) {
    throw new AppError("Conversation not found or access denied", 404);
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content: content.trim(),
  });

  // Update conversation's lastMessage and bump updatedAt
  conversation.lastMessage = message._id;
  await conversation.save();

  // Populate sender info before returning
  await message.populate("sender", "name username avatar");

  return message;
}

/**
 * Get total unread message count across all conversations for a user.
 */
export async function getTotalUnreadCount(userId) {
  // Get all conversation IDs the user is part of
  const conversations = await Conversation.find({
    participants: userId,
  }).select("_id");

  const conversationIds = conversations.map((c) => c._id);

  const count = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: userId },
    read: false,
  });

  return count;
}
