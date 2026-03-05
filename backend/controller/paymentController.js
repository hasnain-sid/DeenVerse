import {
  checkoutRequestSchema,
  subscriptionRequestSchema,
} from "@deenverse/shared";
import {
  createCheckoutSession,
  createSubscriptionSession,
  cancelSubscription as cancelStripeSubscription,
} from "../services/stripeService.js";
import { Payment } from "../models/paymentSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * POST /api/v1/payments/checkout
 * Creates a Stripe Checkout Session for a course purchase.
 * Returns { sessionId, url } for the client to redirect.
 */
export const createCheckout = async (req, res, next) => {
  try {
    const parsed = checkoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }

    const { courseSlug, successUrl, cancelUrl } = parsed.data;
    const result = await createCheckoutSession(
      req.user,
      courseSlug,
      successUrl,
      cancelUrl
    );

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/payments/subscription
 * Creates a Stripe Checkout Session for a subscription plan.
 * Returns { sessionId, url }.
 */
export const createSubscription = async (req, res, next) => {
  try {
    const parsed = subscriptionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }

    const { planId } = parsed.data;
    const result = await createSubscriptionSession(req.user, planId);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/payments/subscription
 * Cancels the user's active subscription at the end of the billing period.
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const result = await cancelStripeSubscription(req.user);
    return res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at the end of the current billing period.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/payments/history
 * Returns a paginated list of the current user's payments.
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ user: req.user }),
    ]);

    return res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
