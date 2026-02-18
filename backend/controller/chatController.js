import {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  getTotalUnreadCount,
} from "../services/chatService.js";
import { getIO } from "../socket/index.js";

export const getConversationsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getUserConversations(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const startConversationHandler = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const conversation = await getOrCreateConversation(req.user, userId);
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const getMessagesHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const data = await getMessages(req.params.id, req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const sendMessageHandler = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await sendMessage(req.params.id, req.user, content);

    // Emit real-time message via Socket.IO
    try {
      const io = getIO();
      // Emit to the conversation room
      io.to(`chat:${req.params.id}`).emit("chat:message", message);

      // Also emit to the recipient's personal room (for notification badge)
      const { Conversation } = await import("../models/conversationSchema.js");
      const conv = await Conversation.findById(req.params.id);
      if (conv) {
        const recipientId = conv.participants.find(
          (p) => p.toString() !== req.user
        );
        if (recipientId) {
          io.to(`user:${recipientId}`).emit("chat:new-message", {
            conversationId: req.params.id,
            message,
          });
        }
      }
    } catch {
      // Socket might not be initialized (e.g. in tests), continue
    }

    return res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const getUnreadMessageCountHandler = async (req, res, next) => {
  try {
    const count = await getTotalUnreadCount(req.user);
    return res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
