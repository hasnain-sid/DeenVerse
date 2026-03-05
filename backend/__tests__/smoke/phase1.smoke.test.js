/**
 * Phase 1 Smoke / Integration Tests
 *
 * Tests all Phase-1 API endpoints (Scholar, Payment, Webhook) against
 * a lightweight Express app backed by mongodb-memory-server.
 *
 * Stripe SDK calls are fully mocked. No live DB or Redis required.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import request from "supertest";

// ── Environment variables (set before any app code imports) ─────────
process.env.TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
process.env.COURSE_COMMISSION_RATE = "0.30";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL_PROD = "http://localhost:3000";

// ── Mock @deenverse/shared (ESM package — must be mocked for Jest CJS) ──
jest.mock("@deenverse/shared", () => {
  // Minimal Zod-like safeParse for checkout and subscription schemas
  return {
    checkoutRequestSchema: {
      safeParse: (data) => {
        if (!data?.courseSlug) {
          return { success: false, error: { errors: [{ message: "Course slug is required" }] } };
        }
        return { success: true, data };
      },
    },
    subscriptionRequestSchema: {
      safeParse: (data) => {
        if (!["student", "premium"].includes(data?.planId)) {
          return { success: false, error: { errors: [{ message: "Invalid plan" }] } };
        }
        return { success: true, data };
      },
    },
  };
});

// ── Mock Stripe SDK ─────────────────────────────────────────────────
const mockCheckoutSessionsCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

// ── Mock notification service (non-critical side-effect) ────────────
jest.mock("../../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock Redis (not needed for smoke tests) ─────────────────────────
jest.mock("../../config/redis.js", () => ({
  getRedisClient: jest.fn(() => null),
  isRedisConnected: jest.fn(() => false),
}));

// ── Mock logger to suppress output during tests ─────────────────────
jest.mock("../../config/logger.js", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ── Models & Routes (imported AFTER mocks are set up) ───────────────
import { User } from "../../models/userSchema.js";
import { Payment } from "../../models/paymentSchema.js";
import scholarRoute from "../../routes/scholarRoute.js";
import paymentRoute from "../../routes/paymentRoute.js";
import webhookRoute from "../../routes/webhookRoute.js";
import errorHandler from "../../middlewares/errorHandler.js";

// ── Test App Factory ────────────────────────────────────────────────
function createApp() {
  const app = express();

  // Webhook route MUST be mounted before express.json() (raw body for Stripe)
  app.use("/api/v1/webhooks", webhookRoute);

  // Body parsing
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Phase 1 routes
  app.use("/api/v1/scholars", scholarRoute);
  app.use("/api/v1/payments", paymentRoute);

  // Centralised error handler
  app.use(errorHandler);

  return app;
}

// ── Helpers ─────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

function validApplicationBody() {
  return {
    credentials: [
      { title: "PhD Islamic Studies", institution: "Al-Azhar University", year: 2018 },
    ],
    specialties: ["tafseer", "hadith"],
    bio: "A dedicated scholar with over 10 years of experience teaching Quranic sciences and hadith methodology at university level.",
    teachingLanguages: ["english", "arabic"],
  };
}

// ─────────────────────────────────────────────────────────────────────
// Test setup
// ─────────────────────────────────────────────────────────────────────

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = createApp();
}, 60_000); // Allow time for first-run MongoDB binary download

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30_000);

afterEach(async () => {
  // Clean collections between tests to ensure isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────
// SCHOLAR FLOW
// ─────────────────────────────────────────────────────────────────────

describe("Scholar Flow", () => {
  // Test 1
  it("1. POST /api/v1/scholars/apply without auth → 401", async () => {
    const res = await request(app)
      .post("/api/v1/scholars/apply")
      .send(validApplicationBody());

    expect(res.status).toBe(401);
  });

  // Test 2
  it("2. Authenticated user POST /api/v1/scholars/apply with valid body → 200, status becomes pending", async () => {
    const user = await User.create({
      name: "Test User",
      username: "testuser1",
      email: "test1@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    const token = signToken(user._id);

    const res = await request(app)
      .post("/api/v1/scholars/apply")
      .set("Authorization", `Bearer ${token}`)
      .send(validApplicationBody());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify application status in DB
    const updated = await User.findById(user._id).lean();
    expect(updated.scholarProfile.applicationStatus).toBe("pending");
  });

  // Test 3
  it("3. Same user GET /api/v1/scholars/application-status → returns pending", async () => {
    const user = await User.create({
      name: "Test User",
      username: "testuser2",
      email: "test2@example.com",
      password: "hashedpassword123",
      role: "user",
      scholarProfile: {
        applicationStatus: "pending",
        applicationDate: new Date(),
        bio: "Test bio",
        specialties: ["fiqh"],
      },
    });

    const token = signToken(user._id);

    const res = await request(app)
      .get("/api/v1/scholars/application-status")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("pending");
  });

  // Test 4
  it("4. POST /api/v1/scholars/apply again while pending → 400 (duplicate)", async () => {
    const user = await User.create({
      name: "Test User",
      username: "testuser3",
      email: "test3@example.com",
      password: "hashedpassword123",
      role: "user",
      scholarProfile: {
        applicationStatus: "pending",
        applicationDate: new Date(),
      },
    });

    const token = signToken(user._id);

    const res = await request(app)
      .post("/api/v1/scholars/apply")
      .set("Authorization", `Bearer ${token}`)
      .send(validApplicationBody());

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 5
  it("5. Admin PUT review with decision=approved → 200, user role becomes scholar", async () => {
    // Create applicant with pending status
    const applicant = await User.create({
      name: "Applicant",
      username: "applicant1",
      email: "applicant1@example.com",
      password: "hashedpassword123",
      role: "user",
      scholarProfile: {
        applicationStatus: "pending",
        applicationDate: new Date(),
        credentials: [{ title: "PhD", institution: "University", year: 2020 }],
        specialties: ["tafseer"],
        bio: "Experienced scholar",
        teachingLanguages: ["english"],
      },
    });

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      username: "admin1",
      email: "admin1@example.com",
      password: "hashedpassword123",
      role: "admin",
    });

    const adminToken = signToken(admin._id);

    const res = await request(app)
      .put(`/api/v1/scholars/admin/applications/${applicant._id}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ decision: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify role change in DB
    const updated = await User.findById(applicant._id).lean();
    expect(updated.role).toBe("scholar");
    expect(updated.scholarProfile.applicationStatus).toBe("approved");
    expect(updated.scholarProfile.verifiedAt).toBeDefined();
  });

  // Test 6
  it("6. Non-admin user GET /api/v1/scholars/admin/applications → 403", async () => {
    const user = await User.create({
      name: "Regular User",
      username: "regular1",
      email: "regular1@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    const token = signToken(user._id);

    const res = await request(app)
      .get("/api/v1/scholars/admin/applications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  // Test 7
  it("7. GET /api/v1/scholars/:id/profile for a scholar → 200 with scholar data", async () => {
    const scholar = await User.create({
      name: "Scholar User",
      username: "scholar1",
      email: "scholar1@example.com",
      password: "hashedpassword123",
      role: "scholar",
      scholarProfile: {
        applicationStatus: "approved",
        verifiedAt: new Date(),
        specialties: ["hadith", "fiqh"],
        bio: "Renowned hadith scholar",
        teachingLanguages: ["english", "arabic"],
        rating: { average: 4.8, count: 120 },
      },
    });

    const res = await request(app).get(`/api/v1/scholars/${scholar._id}/profile`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user._id).toBe(scholar._id.toString());
    expect(res.body.user.role).toBe("scholar");
    expect(res.body.scholarProfile.specialties).toEqual(["hadith", "fiqh"]);
  });

  // Test 8
  it("8. GET /api/v1/scholars/:id/profile for a non-scholar → 404", async () => {
    const user = await User.create({
      name: "Normal User",
      username: "normal1",
      email: "normal1@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    const res = await request(app).get(`/api/v1/scholars/${user._id}/profile`);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────
// PAYMENT FLOW
// ─────────────────────────────────────────────────────────────────────

describe("Payment Flow", () => {
  // Test 9
  it("9. Unauthenticated POST /api/v1/payments/checkout → 401", async () => {
    const res = await request(app)
      .post("/api/v1/payments/checkout")
      .send({ courseSlug: "intro-to-tafseer" });

    expect(res.status).toBe(401);
  });

  // Test 10
  it("10. Authenticated user POST /api/v1/payments/checkout (mock stripe) → 200 with sessionId and url", async () => {
    const user = await User.create({
      name: "Buyer",
      username: "buyer1",
      email: "buyer1@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    // Register Course model for the dynamic import in stripeService
    if (!mongoose.models.Course) {
      const courseSchema = new mongoose.Schema({
        title: String,
        slug: { type: String, unique: true },
        price: Number,
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        enrollmentCount: { type: Number, default: 0 },
      });
      mongoose.model("Course", courseSchema);
    }

    // Create instructor with Stripe Connect
    const instructor = await User.create({
      name: "Instructor",
      username: "instructor1",
      email: "instructor1@example.com",
      password: "hashedpassword123",
      role: "scholar",
      scholarProfile: {
        stripeConnectId: "acct_test_instructor",
        applicationStatus: "approved",
      },
    });

    // Create course
    const Course = mongoose.model("Course");
    await Course.create({
      title: "Intro to Tafseer",
      slug: "intro-to-tafseer",
      price: 4999,
      instructor: instructor._id,
    });

    // Mock Stripe checkout session creation
    mockCheckoutSessionsCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const token = signToken(user._id);

    const res = await request(app)
      .post("/api/v1/payments/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "intro-to-tafseer" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionId).toBe("cs_test_123");
    expect(res.body.url).toContain("checkout.stripe.com");
  });

  // Test 11
  it("11. POST /api/v1/webhooks/stripe with invalid signature → 400", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post("/api/v1/webhooks/stripe")
      .set("stripe-signature", "bad_sig")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "checkout.session.completed" }));

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid signature");
  });

  // Test 12
  it("12. POST /api/v1/webhooks/stripe with valid signature + checkout.session.completed → 200, Payment created", async () => {
    const buyer = await User.create({
      name: "Buyer",
      username: "buyer2",
      email: "buyer2@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    const sessionObj = {
      id: "cs_webhook_test_1",
      mode: "payment",
      amount_total: 4999,
      currency: "usd",
      payment_intent: "pi_test_1",
      client_reference_id: buyer._id.toString(),
      metadata: {
        userId: buyer._id.toString(),
        courseSlug: "intro-to-tafseer",
        courseId: new mongoose.Types.ObjectId().toString(),
      },
    };

    mockConstructEvent.mockReturnValue({
      id: "evt_test_1",
      type: "checkout.session.completed",
      data: { object: sessionObj },
    });

    const res = await request(app)
      .post("/api/v1/webhooks/stripe")
      .set("stripe-signature", "valid_sig")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(sessionObj));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    // Verify Payment record was created
    const payment = await Payment.findOne({ stripeSessionId: "cs_webhook_test_1" }).lean();
    expect(payment).not.toBeNull();
    expect(payment.user.toString()).toBe(buyer._id.toString());
    expect(payment.type).toBe("course-purchase");
    expect(payment.amount).toBe(4999);
    expect(payment.status).toBe("completed");
  });

  // Test 13
  it("13. POST /api/v1/webhooks/stripe same event again → 200, no duplicate Payment (idempotency)", async () => {
    const buyer = await User.create({
      name: "Buyer",
      username: "buyer3",
      email: "buyer3@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    // Pre-create the payment record (simulating first webhook)
    await Payment.create({
      user: buyer._id,
      type: "course-purchase",
      stripeSessionId: "cs_idempotent_test",
      stripePaymentIntentId: "pi_idempotent",
      amount: 2999,
      currency: "usd",
      status: "completed",
    });

    const sessionObj = {
      id: "cs_idempotent_test",
      mode: "payment",
      amount_total: 2999,
      currency: "usd",
      payment_intent: "pi_idempotent",
      client_reference_id: buyer._id.toString(),
      metadata: {
        userId: buyer._id.toString(),
        courseSlug: "another-course",
      },
    };

    mockConstructEvent.mockReturnValue({
      id: "evt_test_dup",
      type: "checkout.session.completed",
      data: { object: sessionObj },
    });

    const res = await request(app)
      .post("/api/v1/webhooks/stripe")
      .set("stripe-signature", "valid_sig")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(sessionObj));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    // Verify no duplicate — still just one payment
    const count = await Payment.countDocuments({ stripeSessionId: "cs_idempotent_test" });
    expect(count).toBe(1);
  });

  // Test 14 — Scholar GET /api/v1/scholars/stripe/status → 200
  it("14. Scholar GET /api/v1/scholars/stripe/status → 200", async () => {
    const scholar = await User.create({
      name: "Scholar Earner",
      username: "scholarearner1",
      email: "scholarearner1@example.com",
      password: "hashedpassword123",
      role: "scholar",
      scholarProfile: {
        applicationStatus: "approved",
        stripeConnectId: "acct_test_scholar",
      },
    });

    // Mock the Stripe retrieve call used by getConnectAccountStatus
    // The stripeService calls stripe.accounts.retrieve internally.
    // Since the whole stripe module is mocked, we need to add accounts mock.
    // Re-configure the stripe mock to include accounts.retrieve
    const Stripe = (await import("stripe")).default;
    Stripe.mockImplementation(() => ({
      checkout: { sessions: { create: mockCheckoutSessionsCreate } },
      webhooks: { constructEvent: mockConstructEvent },
      accounts: {
        retrieve: jest.fn().mockResolvedValue({
          charges_enabled: true,
          payouts_enabled: true,
        }),
      },
    }));

    const token = signToken(scholar._id);

    const res = await request(app)
      .get("/api/v1/scholars/stripe/status")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Test 15 — Non-scholar GET /api/v1/scholars/stripe/status → 403
  it("15. Non-scholar GET /api/v1/scholars/stripe/status → 403", async () => {
    const user = await User.create({
      name: "Regular User",
      username: "regular2",
      email: "regular2@example.com",
      password: "hashedpassword123",
      role: "user",
    });

    const token = signToken(user._id);

    const res = await request(app)
      .get("/api/v1/scholars/stripe/status")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
