import jwt from "jsonwebtoken";
import { AppError } from '../utils/AppError.js';
import { User } from '../models/userSchema.js';
import { cacheGet, cacheSet } from '../services/cacheService.js';

/**
 * Resolve the JWT secrets from environment variables.
 * Falls back gracefully if only one secret is configured.
 */
function getSecrets() {
  const accessSecret = process.env.TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || accessSecret;
  return { accessSecret, refreshSecret };
}

/**
 * Verify an access token (uses TOKEN_SECRET only).
 * Returns decoded payload or throws.
 */
function verifyToken(token) {
  const { accessSecret } = getSecrets();
  if (!accessSecret) {
    throw new Error("JWT secret is not configured");
  }
  return jwt.verify(token, accessSecret);
}

/**
 * Verify a refresh token (uses REFRESH_TOKEN_SECRET).
 * Returns decoded payload or throws.
 */
function verifyRefreshToken(token) {
  const { refreshSecret } = getSecrets();
  if (!refreshSecret) {
    throw new Error("JWT secret is not configured");
  }
  return jwt.verify(token, refreshSecret);
}

/**
 * Extract token from the request.
 * Returns { token, source } where source is 'header' or 'cookie'.
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { token: authHeader.split(' ')[1], source: 'header' };
  }
  const cookieToken = req.cookies?.token || req.cookies?.refreshToken;
  if (cookieToken) {
    return { token: cookieToken, source: 'cookie' };
  }
  return { token: null, source: null };
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
 * Required auth — rejects with 401 if no valid token.
 * Uses access secret for header tokens, refresh secret for cookie tokens.
 */
const isAuthenticated = async (req, res, next) => {
  try {
    const { token, source } = extractToken(req);

    if (!token) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    // Cookie tokens are refresh tokens — verify with refresh secret
    // Header Bearer tokens are access tokens — verify with access secret
    const decoded = source === 'cookie'
      ? verifyRefreshToken(token)
      : verifyToken(token);
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
    const { token, source } = extractToken(req);
    if (token) {
      const decoded = source === 'cookie'
        ? verifyRefreshToken(token)
        : verifyToken(token);
      req.user = decoded.userId;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
};

export default isAuthenticated;