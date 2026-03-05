import express from "express";
import { handleStripeWebhook } from "../controller/webhookController.js";

const router = express.Router();

/**
 * POST /api/v1/webhooks/stripe
 *
 * CRITICAL: This route uses express.raw() to preserve the raw request body
 * required by stripe.webhooks.constructEvent() for signature verification.
 * It must NOT go through the global express.json() middleware.
 *
 * No authentication — Stripe webhook signature is the security mechanism.
 */
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
