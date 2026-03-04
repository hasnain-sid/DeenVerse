import {
  trackEvent,
  getUserGrowth,
  getEngagementMetrics,
  getEventSummary,
  getTopContent,
  getUserInsights,
} from "../services/analyticsService.js";

// ── Track event (called internally or from frontend) ─

export const track = async (req, res, next) => {
  try {
    const { event, metadata } = req.body;
    await trackEvent(req.user, event, metadata, req);
    res.status(201).json({ message: "Event tracked" });
  } catch (err) {
    next(err);
  }
};

export const trackTopicView = async (req, res, next) => {
  try {
    const { topicSlug } = req.body;
    if (!topicSlug) {
      return res.status(400).json({ message: "topicSlug is required" });
    }
    await trackEvent(req.user, "topic_view", { topicSlug }, req);
    res.status(201).json({ message: "Topic view tracked" });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Dashboard overview ────────────────────────

export const dashboardOverview = async (req, res, next) => {
  try {
    const { period = "day", count = 30 } = req.query;

    const [userGrowth, engagement, eventSummary, topContent] = await Promise.all([
      getUserGrowth(period, +count),
      getEngagementMetrics(period, +count),
      getEventSummary(7),
      getTopContent(10),
    ]);

    res.json({
      userGrowth,
      engagement,
      eventSummary,
      topContent,
    });
  } catch (err) {
    next(err);
  }
};

// ── User: Profile insights ──────────────────────────

export const profileInsights = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const insights = await getUserInsights(req.user, +days);
    res.json(insights);
  } catch (err) {
    next(err);
  }
};
