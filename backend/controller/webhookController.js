import Stripe from "stripe";
import { Payment } from "../models/paymentSchema.js";
import { User } from "../models/userSchema.js";
import logger from "../config/logger.js";

/** @type {Stripe | null} */
let _stripe = null;

function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe is not configured — set STRIPE_SECRET_KEY in .env");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * POST /api/v1/webhooks/stripe
 * Verifies the Stripe webhook signature and dispatches to event handlers.
 * CRITICAL: req.body must be the raw Buffer (express.raw middleware), not parsed JSON.
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.warn("Stripe webhook signature verification failed", { error: err.message });
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "account.updated":
        await handleConnectAccountUpdated(event.data.object);
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`, { eventId: event.id });
    }
  } catch (err) {
    // Log the error but still return 200 — Stripe will retry if we return non-200
    logger.error("Error processing Stripe webhook event", {
      eventType: event.type,
      eventId: event.id,
      error: err.message,
    });
  }

  return res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 * Creates a Payment record (idempotent — skips if stripeSessionId already exists).
 * Updates course enrollment count for course purchases.
 */
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId) {
    logger.warn("checkout.session.completed missing userId metadata", { sessionId: session.id });
    return;
  }

  // Build the payment record based on session mode
  let paymentData;

  if (session.mode === "payment") {
    const courseId = session.metadata?.courseId;
    const commissionRate = parseFloat(process.env.COURSE_COMMISSION_RATE || "0.30");
    const amount = session.amount_total ?? 0;
    const platformFee = Math.round(amount * commissionRate);
    const scholarPayout = amount - platformFee;

    paymentData = {
      user: userId,
      type: "course-purchase",
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      amount,
      currency: session.currency || "usd",
      status: "completed",
      course: courseId || undefined,
      platformFee,
      scholarPayout,
    };
  } else if (session.mode === "subscription") {
    const planId = session.metadata?.planId;
    paymentData = {
      user: userId,
      type: "subscription",
      stripeSessionId: session.id,
      amount: session.amount_total ?? 0,
      currency: session.currency || "usd",
      status: "completed",
      subscription: { plan: planId },
    };
  } else {
    return;
  }

  // Idempotent insert — relies on the unique index on stripeSessionId.
  // If a concurrent/duplicate webhook already inserted this record, the
  // duplicate-key error is caught and silently ignored.
  try {
    await Payment.create(paymentData);
  } catch (err) {
    if (err.code === 11000) {
      logger.info("Duplicate checkout.session.completed — skipping", { sessionId: session.id });
      return;
    }
    throw err;
  }

  // Post-insert side effects
  if (session.mode === "payment" && session.metadata?.courseId) {
    try {
      const mongoose = (await import("mongoose")).default;
      const CourseModel = mongoose.model("Course");
      await CourseModel.findByIdAndUpdate(session.metadata.courseId, {
        $inc: { enrollmentCount: 1 },
      });
    } catch {
      // Course model not yet registered (Phase 2) — skip silently
    }
  }

  logger.info("Payment recorded", {
    userId,
    mode: session.mode,
    sessionId: session.id,
  });
}

/**
 * customer.subscription.updated
 * Updates the user's subscription fields to reflect the current Stripe state.
 */
async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    logger.warn("customer.subscription.updated: no user found for customer", { customerId });
    return;
  }

  const planId = subscription.metadata?.planId || extractPlanFromSubscription(subscription);

  user.subscription = {
    plan: planId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    status: subscription.status,
  };

  await user.save();
  logger.info("User subscription updated", {
    userId: user._id,
    plan: planId,
    status: subscription.status,
  });
}

/**
 * customer.subscription.deleted
 * Clears the user's subscription fields (plan deleted/cancelled).
 */
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    logger.warn("customer.subscription.deleted: no user found for customer", { customerId });
    return;
  }

  user.subscription = {
    plan: undefined,
    stripeSubscriptionId: undefined,
    currentPeriodEnd: undefined,
    status: "canceled",
  };

  await user.save();
  logger.info("User subscription deleted/downgraded", { userId: user._id });
}

/**
 * account.updated (Connect)
 * Refreshes the scholar's chargesEnabled and payoutsEnabled flags
 * stored in metadata — useful for onboarding status display.
 */
async function handleConnectAccountUpdated(account) {
  const userId = account.metadata?.userId;
  if (!userId) {
    logger.info("account.updated: no userId in metadata, skipping", {
      accountId: account.id,
    });
    return;
  }

  // We don't store chargesEnabled/payoutsEnabled directly on the user —
  // the frontend fetches live status via GET /stripe/status. Nothing to persist here
  // beyond confirming the account still exists. Log for observability.
  logger.info("Stripe Connect account updated", {
    userId,
    accountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/**
 * Attempt to extract the plan name from a subscription's price nickname or metadata.
 * Falls back to undefined if not determinable.
 * @param {object} subscription Stripe Subscription object
 * @returns {'student'|'premium'|undefined}
 */
function extractPlanFromSubscription(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return undefined;

  if (priceId === process.env.STRIPE_STUDENT_PRICE_ID) return "student";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  return undefined;
}
