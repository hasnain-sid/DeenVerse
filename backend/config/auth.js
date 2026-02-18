import jwt from "jsonwebtoken";
import { AppError } from '../utils/AppError.js';

/**
 * Auth middleware — checks for access token in Authorization header first,
 * then falls back to the refresh token cookie for backward compatibility.
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Prefer the short-lived access token from the Authorization header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback: check the legacy single-token cookie (for /me on first load)
    if (!token) {
      token = req.cookies.token || req.cookies.refreshToken;
    }

    if (!token) {
      return next(new AppError("User not authenticated. Please login.", 401));
    }

    // Try verifying with access token secret first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch {
      // If access token fails, try refresh token secret (for cookie-based fallback)
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET;
      decoded = jwt.verify(token, refreshSecret);
    }

    req.user = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token. Please login again.", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Session expired. Please login again.", 401));
    }
    return next(new AppError("Authentication failed. Please try again later.", 500));
  }
};

export default isAuthenticated;