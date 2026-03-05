import {
  createConnectAccount,
  getExpressDashboardLink,
  getConnectAccountStatus,
  createCheckoutSession,
} from "../services/stripeService.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

const mockStripe = {
  accounts: {
    create: jest.fn(),
    retrieve: jest.fn(),
    createLoginLink: jest.fn(),
  },
  accountLinks: { create: jest.fn() },
  checkout: { sessions: { create: jest.fn() } },
  customers: { create: jest.fn() },
};

jest.mock("stripe", () => {
  return jest.fn(() => mockStripe);
});

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────

function chainQuery(resolvedValue) {
  const chain = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
}

function mockUserDoc(overrides = {}) {
  return {
    _id: "user123",
    email: "scholar@test.com",
    name: "Test Scholar",
    scholarProfile: { stripeConnectId: undefined },
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Ensure STRIPE_SECRET_KEY is set so getStripe() initialises
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.FRONTEND_URL_PROD = "https://deenverse.com";
  process.env.COURSE_COMMISSION_RATE = "0.30";
});

afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────
// createConnectAccount
// ─────────────────────────────────────────────────────────

describe("createConnectAccount", () => {
  it("creates a new Stripe account, stores stripeConnectId, and returns onboarding URL", async () => {
    const user = mockUserDoc();
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    mockStripe.accounts.create.mockResolvedValue({ id: "acct_new123" });
    mockStripe.accountLinks.create.mockResolvedValue({ url: "https://connect.stripe.com/setup/e/abc" });

    const result = await createConnectAccount("user123");

    // Stripe accounts.create called with correct params
    expect(mockStripe.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "express",
        email: "scholar@test.com",
        metadata: { userId: "user123" },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
    );

    // stripeConnectId stored on user
    expect(user.scholarProfile.stripeConnectId).toBe("acct_new123");
    expect(user.save).toHaveBeenCalled();

    // Returns onboarding URL
    expect(result).toEqual({ url: "https://connect.stripe.com/setup/e/abc" });
  });

  it("generates a fresh onboarding link if scholar already has a connect account", async () => {
    const user = mockUserDoc({
      scholarProfile: { stripeConnectId: "acct_existing" },
    });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    mockStripe.accountLinks.create.mockResolvedValue({ url: "https://connect.stripe.com/setup/e/refresh" });

    const result = await createConnectAccount("user123");

    // Should NOT create a new account
    expect(mockStripe.accounts.create).not.toHaveBeenCalled();
    // Should create a new account link for the existing account
    expect(mockStripe.accountLinks.create).toHaveBeenCalledWith(
      expect.objectContaining({ account: "acct_existing" })
    );
    expect(result).toEqual({ url: "https://connect.stripe.com/setup/e/refresh" });
  });

  it("throws AppError 404 if user not found", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(createConnectAccount("nobody")).rejects.toThrow(AppError);
    await expect(createConnectAccount("nobody")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─────────────────────────────────────────────────────────
// getExpressDashboardLink
// ─────────────────────────────────────────────────────────

describe("getExpressDashboardLink", () => {
  it("calls stripe.accounts.createLoginLink and returns the URL", async () => {
    mockStripe.accounts.createLoginLink.mockResolvedValue({ url: "https://connect.stripe.com/express/login" });

    const result = await getExpressDashboardLink("acct_123");

    expect(mockStripe.accounts.createLoginLink).toHaveBeenCalledWith("acct_123");
    expect(result).toEqual({ url: "https://connect.stripe.com/express/login" });
  });

  it("throws AppError 500 when Stripe call fails", async () => {
    mockStripe.accounts.createLoginLink.mockRejectedValue(new Error("Stripe error"));

    await expect(getExpressDashboardLink("acct_bad")).rejects.toThrow(AppError);
    await expect(getExpressDashboardLink("acct_bad")).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

// ─────────────────────────────────────────────────────────
// getConnectAccountStatus
// ─────────────────────────────────────────────────────────

describe("getConnectAccountStatus", () => {
  it("returns connected:true with chargesEnabled and payoutsEnabled from Stripe", async () => {
    mockStripe.accounts.retrieve.mockResolvedValue({
      charges_enabled: true,
      payouts_enabled: false,
    });

    const result = await getConnectAccountStatus("acct_123");

    expect(mockStripe.accounts.retrieve).toHaveBeenCalledWith("acct_123");
    expect(result).toEqual({
      connected: true,
      chargesEnabled: true,
      payoutsEnabled: false,
    });
  });

  it("returns connected:false when Stripe call fails (invalid account)", async () => {
    mockStripe.accounts.retrieve.mockRejectedValue(new Error("No such account"));

    const result = await getConnectAccountStatus("acct_invalid");

    expect(result).toEqual({
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    });
  });
});

// ─────────────────────────────────────────────────────────
// createCheckoutSession
// ─────────────────────────────────────────────────────────

// Mock mongoose for createCheckoutSession's dynamic import
const mockMongooseModel = jest.fn();
jest.mock("mongoose", () => ({
  __esModule: true,
  default: { model: mockMongooseModel },
}));

describe("createCheckoutSession", () => {
  const fakeCourse = {
    _id: "course456",
    title: "Learn Arabic",
    slug: "learn-arabic",
    price: 5000, // $50.00 in cents
    instructor: { scholarProfile: { stripeConnectId: "acct_scholar" } },
  };

  it("creates session with correct application_fee_amount and transfer_data", async () => {
    mockMongooseModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(chainQuery(fakeCourse)),
    });

    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_123",
      url: "https://checkout.stripe.com/c/pay/cs_123",
    });

    const result = await createCheckoutSession("user123", "learn-arabic");

    // 30% commission on $50.00 (5000 cents) = 1500
    const expectedFee = Math.round(5000 * 0.30);
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        application_fee_amount: expectedFee,
        transfer_data: { destination: "acct_scholar" },
        mode: "payment",
        client_reference_id: "user123",
      })
    );

    // success/cancel URLs use FRONTEND_URL_PROD
    const callArgs = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(callArgs.success_url).toContain("https://deenverse.com");
    expect(callArgs.cancel_url).toContain("https://deenverse.com");

    expect(result).toEqual({
      sessionId: "cs_123",
      url: "https://checkout.stripe.com/c/pay/cs_123",
    });
  });

  it("throws AppError 400 when instructor has no Stripe Connect", async () => {
    const courseNoStripe = {
      ...fakeCourse,
      instructor: { scholarProfile: { stripeConnectId: undefined } },
    };

    mockMongooseModel.mockReturnValue({
      findOne: jest.fn().mockReturnValue(chainQuery(courseNoStripe)),
    });

    await expect(createCheckoutSession("user123", "learn-arabic")).rejects.toThrow(
      /Stripe Connect setup/
    );
  });
});
