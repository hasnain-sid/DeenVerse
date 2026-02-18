import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from "../controller/notificationController.js";

const router = express.Router();

// All notification routes require authentication
router.use(isAuthenticated);

router.get("/", getNotificationsHandler);
router.get("/unread-count", getUnreadCountHandler);
router.patch("/read-all", markAllAsReadHandler);
router.patch("/:id/read", markAsReadHandler);

export default router;
