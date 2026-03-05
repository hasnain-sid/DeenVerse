import {
  applyForScholar,
  getApplicationStatus,
  getScholarProfile,
  listApplications,
  reviewApplication,
  listScholars,
  connectStripe,
  getStripeDashboard,
  getStripeConnectStatus,
} from "../services/scholarService.js";

export const applyForScholarHandler = async (req, res, next) => {
  try {
    const result = await applyForScholar(req.user, req.body);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStatusHandler = async (req, res, next) => {
  try {
    const result = await getApplicationStatus(req.user);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getScholarProfileHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getScholarProfile(id);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const listApplicationsHandler = async (req, res, next) => {
  try {
    const status = req.query.status || "pending";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const result = await listApplications(status, page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const reviewApplicationHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { decision, rejectionReason, specialties } = req.body;
    const result = await reviewApplication(req.user, userId, decision, rejectionReason, specialties);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const listScholarsHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const result = await listScholars(page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Stripe Connect handlers ─────────────────────────

export const stripeConnectOnboardHandler = async (req, res, next) => {
  try {
    const result = await connectStripe(req.user);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const stripeExpressDashboardHandler = async (req, res, next) => {
  try {
    const result = await getStripeDashboard(req.user);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const stripeStatusHandler = async (req, res, next) => {
  try {
    const result = await getStripeConnectStatus(req.user);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};
