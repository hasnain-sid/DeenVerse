import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getConversationsHandler,
  startConversationHandler,
  getMessagesHandler,
  sendMessageHandler,
  getUnreadMessageCountHandler,
} from "../controller/chatController.js";

const router = express.Router();

// All chat routes require authentication
router.use(isAuthenticated);

router.get("/conversations", getConversationsHandler);
router.post("/conversations", startConversationHandler);
router.get("/conversations/:id/messages", getMessagesHandler);
router.post("/conversations/:id/messages", sendMessageHandler);
router.get("/unread-count", getUnreadMessageCountHandler);

export default router;
