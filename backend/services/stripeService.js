import Stripe from "stripe";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/** @type {Stripe | null} */
let _stripe = null;

/** Lazy-initialise Stripe so missing key doesn't crash the whole server at import time. */
function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError(
        "Stripe is not configured — set STRIPE_SECRET_KEY in .env",
        503
      );
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Create a Stripe Express Connected Account for a scholar and
 * return the onboarding URL.
 * @param {string} userId
 * @returns {{ url: string }}
 */
export async function createConnectAccount(userId) {
  const user = await User.findById(userId).select(
    "email name scholarProfile.stripeConnectId"
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // If scholar already has a Connect account, generate a fresh onboarding link
  if (user.scholarProfile?.stripeConnectId) {
    try {
      const accountLink = await getStripe().accountLinks.create({
        account: user.scholarProfile.stripeConnectId,
        refresh_url: `${process.env.FRONTEND_URL_PROD}/scholar/stripe-setup?refresh=true`,
        return_url: `${process.env.FRONTEND_URL_PROD}/scholar/stripe-setup?success=true`,
        type: "account_onboarding",
      });
      return { url: accountLink.url };
    } catch (err) {
      logger.error("Failed to create account link for existing connect account", {
        userId,
        stripeConnectId: user.scholarProfile.stripeConnectId,
        error: err.message,
      });
      throw new AppError("Failed to generate Stripe onboarding link", 500);
    }
  }

  try {
    const account = await getStripe().accounts.create({
      type: "express",
      email: user.email,
      metadata: { userId: user._id.toString() },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store the Connect account ID on the user's scholar profile
    user.scholarProfile.stripeConnectId = account.id;
    await user.save();

    const accountLink = await getStripe().accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL_PROD}/scholar/stripe-setup?refresh=true`,
      return_url: `${process.env.FRONTEND_URL_PROD}/scholar/stripe-setup?success=true`,
      type: "account_onboarding",
    });

    logger.info(`Stripe Connect account created for scholar ${userId}`, {
      stripeAccountId: account.id,
    });

    return { url: accountLink.url };
  } catch (err) {
    logger.error("Failed to create Stripe Connect account", {
      userId,
      error: err.message,
    });
    throw new AppError("Failed to create Stripe Connect account", 500);
  }
}

/**
 * Generate a Stripe Express Dashboard login link for a connected account.
 * @param {string} stripeConnectId
 * @returns {{ url: string }}
 */
export async function getExpressDashboardLink(stripeConnectId) {
  try {
    const loginLink = await getStripe().accounts.createLoginLink(stripeConnectId);
    return { url: loginLink.url };
  } catch (err) {
    logger.error("Failed to create Express dashboard link", {
      stripeConnectId,
      error: err.message,
    });
    throw new AppError("Failed to generate Stripe dashboard link", 500);
  }
}

/**
 * Retrieve the status of a Stripe Connected Account.
 * @param {string} stripeConnectId
 * @returns {{ connected: boolean, chargesEnabled: boolean, payoutsEnabled: boolean }}
 */
export async function getConnectAccountStatus(stripeConnectId) {
  try {
    const account = await getStripe().accounts.retrieve(stripeConnectId);
    return {
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch (err) {
    logger.error("Failed to retrieve Stripe Connect account status", {
      stripeConnectId,
      error: err.message,
    });
    // If the account doesn't exist or is invalid, return disconnected
    return {
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }
}

// ─────────────────────────────────────────────────────────
// Stripe Customer helpers
// ─────────────────────────────────────────────────────────

/**
 * Get or create a Stripe Customer for the given user, storing the
 * customer ID on the User document.
 * @param {string} userId
 * @returns {Promise<string>} Stripe customer ID
 */
async function getOrCreateStripeCustomer(userId) {
  const user = await User.findById(userId).select("email name stripeCustomerId");
  if (!user) throw new AppError("User not found", 404);

  if (user.stripeCustomerId) return user.stripeCustomerId;

  try {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });

    user.stripeCustomerId = customer.id;
    await user.save();
    return customer.id;
  } catch (err) {
    logger.error("Failed to create Stripe customer", { userId, error: err.message });
    throw new AppError("Failed to create Stripe customer", 500);
  }
}

// ─────────────────────────────────────────────────────────
// Checkout & Subscription
// ─────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a course purchase.
 * Requires the Course model to be registered (Phase 2).
 * @param {string} userId
 * @param {string} courseSlug
 * @param {string} [successUrl]
 * @param {string} [cancelUrl]
 * @returns {Promise<{ sessionId: string, url: string }>}
 */
export async function createCheckoutSession(userId, courseSlug, successUrl, cancelUrl) {
  const frontendUrl = process.env.FRONTEND_URL_PROD || "http://localhost:3000";

  // Validate redirect URLs are same-origin to prevent open redirects
  if (successUrl && !successUrl.startsWith(frontendUrl)) successUrl = undefined;
  if (cancelUrl && !cancelUrl.startsWith(frontendUrl)) cancelUrl = undefined;

  // Resolve Course model dynamically — added in Phase 2
  let CourseModel;
  try {
    const mongoose = (await import("mongoose")).default;
    CourseModel = mongoose.model("Course");
  } catch {
    throw new AppError("Course catalog is not yet available", 503);
  }

  const course = await CourseModel.findOne({ slug: courseSlug })
    .populate("instructor", "scholarProfile.stripeConnectId")
    .lean();
  if (!course) throw new AppError("Course not found", 404);

  const scholarConnectId = course.instructor?.scholarProfile?.stripeConnectId;
  if (!scholarConnectId) {
    throw new AppError("Instructor has not completed Stripe Connect setup", 400);
  }

  const commissionRate = parseFloat(process.env.COURSE_COMMISSION_RATE || "0.30");
  const applicationFee = Math.round(course.price * commissionRate);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.title },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      application_fee_amount: applicationFee,
      transfer_data: { destination: scholarConnectId },
      success_url:
        successUrl ||
        `${frontendUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${frontendUrl}/checkout?canceled=true`,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
        courseSlug,
        courseId: course._id.toString(),
      },
    });

    logger.info("Stripe checkout session created", { userId, courseSlug, sessionId: session.id });
    return { sessionId: session.id, url: session.url };
  } catch (err) {
    logger.error("Failed to create Stripe checkout session", {
      userId,
      courseSlug,
      error: err.message,
    });
    throw new AppError("Failed to create checkout session", 500);
  }
}

/**
 * Create a Stripe Checkout Session for a subscription plan.
 * Requires STRIPE_STUDENT_PRICE_ID / STRIPE_PREMIUM_PRICE_ID env vars.
 * @param {string} userId
 * @param {'student'|'premium'} planId
 * @returns {Promise<{ sessionId: string, url: string }>}
 */
export async function createSubscriptionSession(userId, planId) {
  const priceIdMap = {
    student: process.env.STRIPE_STUDENT_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  };
  const priceId = priceIdMap[planId];
  if (!priceId) {
    throw new AppError(`Stripe price ID not configured for plan: ${planId}`, 500);
  }

  const customerId = await getOrCreateStripeCustomer(userId);
  const frontendUrl = process.env.FRONTEND_URL_PROD || "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription?canceled=true`,
      subscription_data: {
        metadata: { planId, userId: userId.toString() },
      },
      metadata: {
        userId: userId.toString(),
        planId,
      },
    });

    logger.info("Stripe subscription session created", { userId, planId, sessionId: session.id });
    return { sessionId: session.id, url: session.url };
  } catch (err) {
    logger.error("Failed to create subscription session", {
      userId,
      planId,
      error: err.message,
    });
    throw new AppError("Failed to create subscription session", 500);
  }
}

/**
 * Cancel the active Stripe subscription for a user (at period end).
 * @param {string} userId
 * @returns {Promise<{ cancelAt: Date }>}
 */
export async function cancelSubscription(userId) {
  const user = await User.findById(userId).select("subscription").lean();
  if (!user) throw new AppError("User not found", 404);

  const subscriptionId = user.subscription?.stripeSubscriptionId;
  if (!subscriptionId) throw new AppError("No active subscription found", 400);

  try {
    const updated = await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return { cancelAt: new Date(updated.current_period_end * 1000) };
  } catch (err) {
    logger.error("Failed to cancel subscription", {
      userId,
      subscriptionId,
      error: err.message,
    });
    throw new AppError("Failed to cancel subscription", 500);
  }
}

/**
 * Retrieve aggregate payment overview for admin dashboard.
 * @param {'month'|'quarter'|'year'} period
 * @returns {Promise<object>}
 */
export async function getAdminPaymentOverview(period) {
  const { Payment } = await import("../models/paymentSchema.js");

  const now = new Date();
  const startDate = new Date(now);
  if (period === "month") startDate.setMonth(now.getMonth() - 1);
  else if (period === "quarter") startDate.setMonth(now.getMonth() - 3);
  else startDate.setFullYear(now.getFullYear() - 1);

  const [aggregation] = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalCommission: { $sum: "$platformFee" },
        totalPayouts: { $sum: "$scholarPayout" },
        count: { $sum: 1 },
      },
    },
  ]);

  return aggregation
    ? {
        totalRevenue: aggregation.totalRevenue,
        totalCommission: aggregation.totalCommission,
        totalPayouts: aggregation.totalPayouts,
        transactionCount: aggregation.count,
      }
    : { totalRevenue: 0, totalCommission: 0, totalPayouts: 0, transactionCount: 0 };
}
