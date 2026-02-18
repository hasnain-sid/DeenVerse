import jwt from "jsonwebtoken";
import { AppError } from '../utils/AppError.js';

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
 * Try to verify a token against access secret first, then refresh secret.
 * Returns decoded payload or throws.
 */
function verifyToken(token) {
  const { accessSecret, refreshSecret } = getSecrets();

  if (!accessSecret) {
    throw new Error("JWT secret is not configured");
  }

  try {
    return jwt.verify(token, accessSecret);
  } catch {
    // If access token verification fails, try refresh secret
    if (refreshSecret !== accessSecret) {
      return jwt.verify(token, refreshSecret);
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Extract bearer token from Authorization header or cookie.
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.token || req.cookies?.refreshToken || null;
}

/**
 * Required auth — rejects with 401 if no valid token.
 */
const isAuthenticated = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    const decoded = verifyToken(token);
    req.user = decoded.userId;
    next();
  } catch (error) {
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
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
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