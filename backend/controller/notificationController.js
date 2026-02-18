import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService.js";

export const getNotificationsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const data = await getNotifications(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCountHandler = async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user);
    return res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

export const markAsReadHandler = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user);
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsReadHandler = async (req, res, next) => {
  try {
    const data = await markAllAsRead(req.user);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
