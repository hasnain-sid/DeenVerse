import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  createCheckout,
  createSubscription,
  cancelSubscription,
  getPaymentHistory,
} from "../controller/paymentController.js";

const router = express.Router();

// POST /api/v1/payments/checkout — create Stripe Checkout Session for a course
router.post("/checkout", isAuthenticated, createCheckout);

// POST /api/v1/payments/subscription — create Stripe Checkout Session for a plan
router.post("/subscription", isAuthenticated, createSubscription);

// DELETE /api/v1/payments/subscription — cancel active subscription at period end
router.delete("/subscription", isAuthenticated, cancelSubscription);

// GET /api/v1/payments/history — paginated payment history for the current user
router.get("/history", isAuthenticated, getPaymentHistory);

export default router;
