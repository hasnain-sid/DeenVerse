import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import { getRedisClient, isRedisConnected } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";

/**
 * Rate-limiting middleware factory.
 *
 * Uses Redis when available (distributed, survives restarts),
 * otherwise falls back to in-memory (single-process).
 *
 * Usage:
 *   app.use('/api/v1/user/login', rateLimiter({ points: 5, duration: 900, keyPrefix: 'login' }));
 */
function createLimiter(opts) {
  const redisClient = isRedisConnected() ? getRedisClient() : null;

  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      ...opts,
    });
  }

  return new RateLimiterMemory(opts);
}

/**
 * Express middleware wrapper around a rate limiter.
 * @param {object} options — { points, duration, keyPrefix, keyGenerator }
 *   - points: max requests per window
 *   - duration: window in seconds
 *   - keyPrefix: unique name for this limiter
 *   - keyGenerator: (req) => string — custom key (default: IP)
 */
export function rateLimiter({
  points = 100,
  duration = 60,
  keyPrefix = "rl_general",
  keyGenerator,
  message,
} = {}) {
  const limiter = createLimiter({ points, duration, keyPrefix });

  return async (req, res, next) => {
    try {
      const key = keyGenerator
        ? keyGenerator(req)
        : req.ip || req.connection?.remoteAddress || "unknown";

      const rateLimiterRes = await limiter.consume(key);

      // Set rate-limit headers so clients can adapt
      res.set({
        "X-RateLimit-Limit": String(points),
        "X-RateLimit-Remaining": String(rateLimiterRes.remainingPoints),
        "X-RateLimit-Reset": String(
          Math.ceil(Date.now() / 1000) + Math.ceil(rateLimiterRes.msBeforeNext / 1000)
        ),
      });

      next();
    } catch (rejRes) {
      // rejRes is a RateLimiterRes when rejected
      const retryAfter = Math.ceil((rejRes?.msBeforeNext || 60000) / 1000);
      res.set({
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(points),
        "X-RateLimit-Remaining": "0",
      });

      return next(
        new AppError(
          message || "Too many requests. Please try again later.",
          429
        )
      );
    }
  };
}

// ── Pre-configured limiters for common endpoints ──────

/** Login: 5 requests per 15 minutes per IP. */
export const loginLimiter = rateLimiter({
  points: 5,
  duration: 15 * 60,
  keyPrefix: "rl_login",
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/** Register: 3 requests per hour per IP. */
export const registerLimiter = rateLimiter({
  points: 3,
  duration: 60 * 60,
  keyPrefix: "rl_register",
  message: "Too many registration attempts. Please try again later.",
});

/** Create post: 30 per hour per user. */
export const createPostLimiter = rateLimiter({
  points: 30,
  duration: 60 * 60,
  keyPrefix: "rl_create_post",
  keyGenerator: (req) => req.user || req.ip,
  message: "Post limit reached. Please slow down.",
});

/** Feed: 60 requests per minute per user. */
export const feedLimiter = rateLimiter({
  points: 60,
  duration: 60,
  keyPrefix: "rl_feed",
  keyGenerator: (req) => req.user || req.ip,
});

/** Hadith: 120 requests per minute per user/IP. */
export const hadithLimiter = rateLimiter({
  points: 120,
  duration: 60,
  keyPrefix: "rl_hadith",
  keyGenerator: (req) => req.user || req.ip,
});

/** Upload: 10 per hour per user. */
export const uploadLimiter = rateLimiter({
  points: 10,
  duration: 60 * 60,
  keyPrefix: "rl_upload",
  keyGenerator: (req) => req.user || req.ip,
  message: "Upload limit reached. Please try again later.",
});

/** General API: 100 requests per minute per IP. */
export const generalLimiter = rateLimiter({
  points: 100,
  duration: 60,
  keyPrefix: "rl_general",
});
