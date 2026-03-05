import { handleStripeWebhook } from "../controller/webhookController.js";
import { Payment } from "../models/paymentSchema.js";
import { User } from "../models/userSchema.js";

// ── Mock dependencies ───────────────────────────────────

const mockConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

jest.mock("../models/paymentSchema.js", () => ({
  Payment: { create: jest.fn() },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { findOne: jest.fn() },
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────

function makeReq(body = Buffer.from("{}"), sig = "sig_valid") {
  return {
    body,
    headers: { "stripe-signature": sig },
  };
}

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

function stripeEvent(type, dataObject, id = "evt_test") {
  return { id, type, data: { object: dataObject } };
}

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.COURSE_COMMISSION_RATE = "0.30";
});

afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────
// Signature verification
// ─────────────────────────────────────────────────────────

describe("Webhook signature verification", () => {
  it("returns 400 when signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Invalid signature"),
      })
    );
  });

  it("processes event when signature is valid", async () => {
    mockConstructEvent.mockReturnValue(
      stripeEvent("unknown.event.type", {})
    );

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});

// ─────────────────────────────────────────────────────────
// checkout.session.completed
// ─────────────────────────────────────────────────────────

describe("checkout.session.completed", () => {
  const session = {
    id: "cs_abc",
    mode: "payment",
    payment_intent: "pi_123",
    amount_total: 5000,
    currency: "usd",
    metadata: { userId: "user1", courseId: "course1", courseSlug: "arabic" },
    client_reference_id: "user1",
  };

  it("creates a Payment record with correct fields", async () => {
    mockConstructEvent.mockReturnValue(
      stripeEvent("checkout.session.completed", session)
    );
    Payment.create.mockResolvedValue({});

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user1",
        type: "course-purchase",
        stripeSessionId: "cs_abc",
        stripePaymentIntentId: "pi_123",
        amount: 5000,
        currency: "usd",
        status: "completed",
        course: "course1",
        platformFee: Math.round(5000 * 0.30),
        scholarPayout: 5000 - Math.round(5000 * 0.30),
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("is idempotent — duplicate event does not create a second Payment", async () => {
    mockConstructEvent.mockReturnValue(
      stripeEvent("checkout.session.completed", session)
    );

    // Simulate MongoDB duplicate-key error (code 11000)
    const dupError = new Error("E11000 duplicate key error");
    dupError.code = 11000;
    Payment.create.mockRejectedValue(dupError);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    // Should still return 200 (not crash)
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("handles subscription-mode checkout correctly", async () => {
    const subSession = {
      id: "cs_sub",
      mode: "subscription",
      amount_total: 999,
      currency: "usd",
      metadata: { userId: "user2", planId: "student" },
      client_reference_id: "user2",
    };
    mockConstructEvent.mockReturnValue(
      stripeEvent("checkout.session.completed", subSession)
    );
    Payment.create.mockResolvedValue({});

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user2",
        type: "subscription",
        stripeSessionId: "cs_sub",
        amount: 999,
        status: "completed",
        subscription: { plan: "student" },
      })
    );
  });
});

// ─────────────────────────────────────────────────────────
// customer.subscription.updated
// ─────────────────────────────────────────────────────────

describe("customer.subscription.updated", () => {
  it("updates user subscription fields", async () => {
    const subscription = {
      id: "sub_1",
      customer: "cus_abc",
      status: "active",
      current_period_end: 1735689600, // 2025-01-01T00:00:00Z
      metadata: { planId: "premium" },
      items: { data: [{ price: { id: "price_premium" } }] },
    };
    mockConstructEvent.mockReturnValue(
      stripeEvent("customer.subscription.updated", subscription)
    );

    const userDoc = {
      _id: "user1",
      subscription: {},
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findOne.mockResolvedValue(userDoc);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ stripeCustomerId: "cus_abc" });
    expect(userDoc.subscription).toEqual({
      plan: "premium",
      stripeSubscriptionId: "sub_1",
      currentPeriodEnd: new Date(1735689600 * 1000),
      status: "active",
    });
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("logs warning and returns 200 if no user found for customer", async () => {
    const subscription = {
      id: "sub_2",
      customer: "cus_unknown",
      status: "active",
      current_period_end: 1735689600,
      metadata: {},
    };
    mockConstructEvent.mockReturnValue(
      stripeEvent("customer.subscription.updated", subscription)
    );
    User.findOne.mockResolvedValue(null);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────
// customer.subscription.deleted
// ─────────────────────────────────────────────────────────

describe("customer.subscription.deleted", () => {
  it("downgrades user plan and sets status to canceled", async () => {
    const subscription = {
      id: "sub_del",
      customer: "cus_del",
    };
    mockConstructEvent.mockReturnValue(
      stripeEvent("customer.subscription.deleted", subscription)
    );

    const userDoc = {
      _id: "user1",
      subscription: {
        plan: "premium",
        stripeSubscriptionId: "sub_del",
        currentPeriodEnd: new Date(),
        status: "active",
      },
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findOne.mockResolvedValue(userDoc);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(userDoc.subscription).toEqual(
      expect.objectContaining({
        plan: undefined,
        stripeSubscriptionId: undefined,
        currentPeriodEnd: undefined,
        status: "canceled",
      })
    );
    expect(userDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────
// Unknown event type
// ─────────────────────────────────────────────────────────

describe("Unknown event type", () => {
  it("returns 200 without crashing", async () => {
    mockConstructEvent.mockReturnValue(
      stripeEvent("some.future.event", { foo: "bar" })
    );

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
