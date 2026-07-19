/**
 * Tests for banned-account enforcement:
 *  - isAuthenticated rejects banned users (with cache fast-path)
 *  - loginUser rejects banned users
 *  - moderation ban/unban invalidates the ban cache
 */

import jwt from "jsonwebtoken";

process.env.TOKEN_SECRET = "test-access-secret-ban";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-ban";

// ── Mocks ───────────────────────────────────────────────

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn(), findOne: jest.fn(), findByIdAndUpdate: jest.fn() },
}));

jest.mock("../services/cacheService.js", () => ({
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  cacheDel: jest.fn().mockResolvedValue(undefined),
  cacheUserProfile: jest.fn(),
  getCachedUserProfile: jest.fn(),
  invalidateUserCache: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { compare: jest.fn().mockResolvedValue(true), hash: jest.fn() },
}));

jest.mock("../utils/tokenUtils.js", () => ({
  generateAccessToken: jest.fn(() => "access-token"),
  generateRefreshToken: jest.fn(() => "refresh-token"),
}));

jest.mock("../services/notificationService.js", () => ({
  createFollowNotification: jest.fn(),
  createAndEmitNotification: jest.fn(),
}));

jest.mock("../services/emailService.js", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("../models/auditLogSchema.js", () => ({
  AuditLog: { create: jest.fn().mockResolvedValue(undefined) },
}));

import isAuthenticated from "../config/auth.js";
import { loginUser } from "../services/userService.js";
import { banUser, unbanUser } from "../services/moderationService.js";
import { User } from "../models/userSchema.js";
import { cacheGet, cacheSet, cacheDel } from "../services/cacheService.js";

// ── Helpers ─────────────────────────────────────────────

const USER_ID = "64b000000000000000000001";

function makeReq(userId = USER_ID) {
  return {
    headers: { authorization: `Bearer ${jwt.sign({ userId }, process.env.TOKEN_SECRET)}` },
    cookies: {},
  };
}

function mockBannedLookup(banned) {
  User.findById.mockReturnValue({
    select: () => ({ lean: async () => ({ banned }) }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  cacheGet.mockResolvedValue(null);
});

// ── isAuthenticated ─────────────────────────────────────

describe("isAuthenticated — banned enforcement", () => {
  it("rejects a banned user with 403", async () => {
    mockBannedLookup(true);
    const req = makeReq();
    const next = jest.fn();

    await isAuthenticated(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/suspended/i);
    expect(req.user).toBeUndefined();
  });

  it("lets a non-banned user through and caches the result", async () => {
    mockBannedLookup(false);
    const req = makeReq();
    const next = jest.fn();

    await isAuthenticated(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBe(USER_ID);
    expect(cacheSet).toHaveBeenCalledWith(`user:banned:${USER_ID}`, false, expect.any(Number));
  });

  it("rejects from cache without hitting the DB", async () => {
    cacheGet.mockResolvedValue(true);
    const next = jest.fn();

    await isAuthenticated(makeReq(), {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(403);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("passes from a cached false without hitting the DB", async () => {
    cacheGet.mockResolvedValue(false);
    const req = makeReq();
    const next = jest.fn();

    await isAuthenticated(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("treats a missing user document as not banned", async () => {
    User.findById.mockReturnValue({ select: () => ({ lean: async () => null }) });
    const req = makeReq();
    const next = jest.fn();

    await isAuthenticated(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("still rejects missing tokens with 401", async () => {
    const next = jest.fn();

    await isAuthenticated({ headers: {}, cookies: {} }, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it("still rejects invalid tokens with 401", async () => {
    const next = jest.fn();

    await isAuthenticated(
      { headers: { authorization: "Bearer not-a-jwt" }, cookies: {} },
      {},
      next
    );

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });
});

// ── loginUser ───────────────────────────────────────────

describe("loginUser — banned enforcement", () => {
  it("rejects a banned user with 403 even with correct credentials", async () => {
    User.findOne.mockResolvedValue({
      _id: USER_ID,
      name: "Banned User",
      password: "hashed",
      banned: true,
    });

    await expect(loginUser({ email: "a@b.c", password: "pw" })).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringMatching(/suspended/i),
    });
  });

  it("logs in a non-banned user", async () => {
    User.findOne.mockResolvedValue({
      _id: USER_ID,
      name: "Good User",
      password: "hashed",
      banned: false,
    });
    User.findById.mockReturnValue({
      select: async () => ({ _id: USER_ID, name: "Good User" }),
    });

    const result = await loginUser({ email: "a@b.c", password: "pw" });
    expect(result.success).toBe(true);
  });
});

// ── Moderation cache invalidation ───────────────────────

describe("moderation ban/unban — cache invalidation", () => {
  it("banUser clears the ban cache key", async () => {
    User.findById.mockResolvedValue({
      banned: false,
      save: jest.fn().mockResolvedValue(undefined),
    });

    await banUser("admin1", USER_ID, "spam");

    expect(cacheDel).toHaveBeenCalledWith(`user:banned:${USER_ID}`);
  });

  it("unbanUser clears the ban cache key", async () => {
    User.findById.mockResolvedValue({
      banned: true,
      save: jest.fn().mockResolvedValue(undefined),
    });

    await unbanUser("admin1", USER_ID);

    expect(cacheDel).toHaveBeenCalledWith(`user:banned:${USER_ID}`);
  });
});
