import { isScholar, isScholarOrAdmin } from "../middlewares/admin.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn() },
}));

// Helper to build a mock req/res/next chain
function buildMocks(userId) {
  const req = { user: userId };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

// ─── isScholar ──────────────────────────────────────────

describe("isScholar middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_IDS;
  });

  it("allows user with role 'scholar'", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "scholar" }) }) });
    const { req, res, next } = buildMocks("user123");

    await isScholar(req, res, next);

    expect(next).toHaveBeenCalledWith(); // called with no args → pass-through
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("allows user with role 'admin'", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "admin" }) }) });
    const { req, res, next } = buildMocks("user456");

    await isScholar(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks user with role 'user'", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "user" }) }) });
    const { req, res, next } = buildMocks("user789");

    await isScholar(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it("blocks user with role 'moderator'", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "moderator" }) }) });
    const { req, res, next } = buildMocks("modUser");

    await isScholar(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it("returns 404 when user is not found", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) });
    const { req, res, next } = buildMocks("ghost");

    await isScholar(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toMatch(/not found/i);
  });

  it("handles DB errors gracefully", async () => {
    const dbError = new Error("DB connection failed");
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(dbError) }) });
    const { req, res, next } = buildMocks("user000");

    await isScholar(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it("allows through when user ID is in ADMIN_IDS env var", async () => {
    process.env.ADMIN_IDS = "envAdmin1,envAdmin2";
    const { req, res, next } = buildMocks("envAdmin1");

    await isScholar(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(User.findById).not.toHaveBeenCalled(); // short-circuits before DB
  });
});

// ─── isScholarOrAdmin ───────────────────────────────────

describe("isScholarOrAdmin middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_IDS;
  });

  it("is the same function reference as isScholar", () => {
    expect(isScholarOrAdmin).toBe(isScholar);
  });

  it("allows scholar role", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "scholar" }) }) });
    const { req, res, next } = buildMocks("s1");

    await isScholarOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("allows admin role", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "admin" }) }) });
    const { req, res, next } = buildMocks("a1");

    await isScholarOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks regular user role", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "user" }) }) });
    const { req, res, next } = buildMocks("u1");

    await isScholarOrAdmin(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it("blocks moderator role", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ role: "moderator" }) }) });
    const { req, res, next } = buildMocks("m1");

    await isScholarOrAdmin(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it("returns 404 for missing user", async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }) });
    const { req, res, next } = buildMocks("noone");

    await isScholarOrAdmin(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
  });

  it("forwards DB errors to next()", async () => {
    const dbErr = new Error("timeout");
    User.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(dbErr) }) });
    const { req, res, next } = buildMocks("x");

    await isScholarOrAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith(dbErr);
  });
});
