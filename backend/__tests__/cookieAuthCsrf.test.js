/**
 * CSRF: the refresh cookie must not authenticate anything except POST /user/refresh.
 *
 * The cookie is httpOnly but `sameSite: 'None'` in production (utils/tokenUtils.js),
 * so the browser attaches it to cross-site requests. When isAuthenticated accepted it
 * as full authentication, any page a logged-in user visited could drive a
 * state-changing request as them — the attacker could not read the response, but the
 * write had already landed.
 */

import jwt from "jsonwebtoken";

process.env.TOKEN_SECRET = "test-access-secret-csrf";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-csrf";

// ── Mocks ───────────────────────────────────────────────

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.mock("../services/cacheService.js", () => ({
  cacheGet: jest.fn().mockResolvedValue(false),
  cacheSet: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../services/userService.js", () => ({
  refreshSession: jest.fn(),
}));

jest.mock("../services/streakService.js", () => ({
  getUserStreak: jest.fn(),
  updateStreakGoal: jest.fn(),
}));

import isAuthenticated, { optionalAuth } from "../config/auth.js";
import { authenticateSocket } from "../socket/index.js";
import { refresh } from "../controller/userController.js";
import { refreshSession } from "../services/userService.js";

// ── Helpers ─────────────────────────────────────────────

const USER_ID = "64b000000000000000000001";

const accessToken = (userId = USER_ID) =>
  jwt.sign({ userId }, process.env.TOKEN_SECRET, { expiresIn: "15m" });

const refreshToken = (userId = USER_ID) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

function makeReq({ headers = {}, cookies = {} } = {}) {
  return { headers, cookies };
}

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────
// isAuthenticated
// ─────────────────────────────────────────────────────────

describe("isAuthenticated — cookie is not authentication", () => {
  it("rejects a request carrying only a valid refreshToken cookie", async () => {
    const next = jest.fn();

    // Exactly the shape of a forged cross-site POST: no Authorization header, but the
    // browser has attached the victim's refresh cookie.
    await isAuthenticated(
      makeReq({ cookies: { refreshToken: refreshToken() } }),
      {},
      next
    );

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  it("rejects a request carrying only a `token` cookie", async () => {
    const next = jest.fn();

    await isAuthenticated(makeReq({ cookies: { token: accessToken() } }), {}, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  it("does not set req.user when only a cookie is present", async () => {
    const req = makeReq({ cookies: { refreshToken: refreshToken() } });

    await isAuthenticated(req, {}, jest.fn());

    expect(req.user).toBeUndefined();
  });

  it("still accepts a valid bearer access token", async () => {
    const req = makeReq({ headers: { authorization: `Bearer ${accessToken()}` } });
    const next = jest.fn();

    await isAuthenticated(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBe(USER_ID);
  });

  it("rejects a refresh token presented as a bearer token", async () => {
    const next = jest.fn();

    // Signed with the refresh secret, so the access-token verifier must not accept it.
    await isAuthenticated(
      makeReq({ headers: { authorization: `Bearer ${refreshToken()}` } }),
      {},
      next
    );

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
// optionalAuth
// ─────────────────────────────────────────────────────────

describe("optionalAuth — cookie does not identify the user", () => {
  it("leaves req.user null for a cookie-only request", async () => {
    const req = makeReq({ cookies: { refreshToken: refreshToken() } });
    const next = jest.fn();

    await optionalAuth(req, {}, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("still identifies the user from a bearer access token", async () => {
    const req = makeReq({ headers: { authorization: `Bearer ${accessToken()}` } });

    await optionalAuth(req, {}, jest.fn());

    expect(req.user).toBe(USER_ID);
  });
});

// ─────────────────────────────────────────────────────────
// POST /user/refresh — the one endpoint the cookie still authenticates
// ─────────────────────────────────────────────────────────

describe("POST /user/refresh", () => {
  it("still authenticates from the refresh cookie and issues an access token", async () => {
    refreshSession.mockResolvedValue({
      statusCode: 200,
      user: { _id: USER_ID },
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await refresh({ cookies: { refreshToken: refreshToken() } }, res, jest.fn());

    expect(refreshSession).toHaveBeenCalledWith(USER_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "new-access-token", success: true })
    );
  });

  it("401s without the cookie", async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await refresh({ cookies: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(refreshSession).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────
// Socket.IO handshake
// ─────────────────────────────────────────────────────────

function makeSocket({ auth = {}, headers = {} } = {}) {
  return { handshake: { auth, headers } };
}

describe("Socket.IO handshake — cookie is not authentication", () => {
  it("rejects a handshake carrying only the refresh cookie", async () => {
    const socket = makeSocket({
      headers: { cookie: `refreshToken=${refreshToken()}` },
    });
    const next = jest.fn();

    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(socket.userId).toBeUndefined();
  });

  it("accepts a handshake carrying an access token", async () => {
    const socket = makeSocket({ auth: { token: accessToken() } });
    const next = jest.fn();

    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect(socket.userId).toBe(USER_ID);
  });

  it("rejects a refresh token offered as the handshake token", async () => {
    const socket = makeSocket({ auth: { token: refreshToken() } });
    const next = jest.fn();

    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(socket.userId).toBeUndefined();
  });
});
