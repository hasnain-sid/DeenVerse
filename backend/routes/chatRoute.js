import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getConversationsHandler,
  startConversationHandler,
  getMessagesHandler,
  sendMessageHandler,
  getUnreadMessageCountHandler,
} from "../controller/chatController.js";
import {
  startConversationValidationRules,
  sendMessageValidationRules,
} from "../middlewares/validators.js";
import {
  createConversationLimiter,
  chatMessageLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();

// All chat routes require authentication
router.use(isAuthenticated);

router.get("/conversations", getConversationsHandler);
router.post("/conversations", createConversationLimiter, startConversationValidationRules(), startConversationHandler);
router.get("/conversations/:id/messages", getMessagesHandler);
router.post("/conversations/:id/messages", chatMessageLimiter, sendMessageValidationRules(), sendMessageHandler);
router.get("/unread-count", getUnreadMessageCountHandler);

export default router;
