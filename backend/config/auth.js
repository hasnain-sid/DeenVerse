import jwt from "jsonwebtoken";
import { AppError } from '../utils/AppError.js';
import { User } from '../models/userSchema.js';
import { cacheGet, cacheSet } from '../services/cacheService.js';

/**
 * Verify an access token (uses TOKEN_SECRET only).
 *
 * There is no refresh-token verifier here on purpose: this module authenticates
 * requests, and refresh tokens are not request credentials. POST /user/refresh
 * verifies its own via utils/tokenUtils.js.
 *
 * Returns decoded payload or throws.
 */
function verifyToken(token) {
  const accessSecret = process.env.TOKEN_SECRET;
  if (!accessSecret) {
    throw new Error("JWT secret is not configured");
  }
  return jwt.verify(token, accessSecret);
}

/**
 * Extract the access token from the Authorization header.
 *
 * Deliberately does NOT fall back to the refresh cookie. That cookie is sent
 * automatically by the browser on cross-site requests (`sameSite: 'None'` in
 * production — see utils/tokenUtils.js), so accepting it as proof of intent made
 * every state-changing endpoint forgeable from any origin the user visited while
 * logged in. An attacker's page could not read the response, but the write had
 * already happened.
 *
 * The refresh cookie now authenticates exactly one thing: POST /user/refresh,
 * which reads it directly in the controller and trades it for an access token.
 *
 * Returns { token } — null when no bearer token is present.
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { token: authHeader.split(' ')[1] };
  }
  return { token: null };
}

const BAN_CHECK_TTL = 60; // seconds

/**
 * Reject requests from banned accounts. The lookup is cached briefly so the
 * per-request cost stays low; moderation invalidates the key on ban/unban.
 */
async function assertNotBanned(userId) {
  const cacheKey = `user:banned:${userId}`;
  let banned = await cacheGet(cacheKey);
  if (banned === null || banned === undefined) {
    const user = await User.findById(userId).select("banned").lean();
    banned = !!user?.banned;
    await cacheSet(cacheKey, banned, BAN_CHECK_TTL);
  }
  if (banned === true || banned === "true") {
    throw new AppError("Your account has been suspended. Contact support if you believe this is a mistake.", 403);
  }
}

/**
 * Required auth — rejects with 401 if no valid bearer token.
 * Access tokens only; a refresh cookie alone is not authentication.
 */
const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = extractToken(req);

    if (!token) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const decoded = verifyToken(token);
    await assertNotBanned(decoded.userId);
    req.user = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.message === "JWT secret is not configured") {
      console.error("FATAL: TOKEN_SECRET is not set in environment variables");
      return next(new AppError("Server configuration error", 500));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Session expired. Please login again.", 401));
    }
    return next(new AppError("Invalid token. Please login again.", 401));
  }
};

/**
 * Optional auth — sets req.user if a valid token is present,
 * otherwise sets req.user = null and continues without rejecting.
 * Use on public routes where you want to optionally identify the user.
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const { token } = extractToken(req);
    req.user = token ? verifyToken(token).userId : null;
  } catch {
    req.user = null;
  }
  next();
};

export default isAuthenticated;