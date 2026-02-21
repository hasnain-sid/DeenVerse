import { getRedisClient, isRedisConnected } from "../config/redis.js";

/**
 * Cache service — thin wrapper around Redis with graceful fallback.
 *
 * If Redis is not available every method is a no-op, so the rest of the
 * application works exactly the same — just without caching.
 *
 * Key naming convention:
 *   user:{id}           → user profile
 *   feed:{userId}:{tab}:{page} → feed page
 *   trending:hashtags   → trending hashtags
 *   notification:unread:{userId} → unread notification count
 */

// ── Default TTLs (seconds) ────────────────────────────
export const TTL = {
  USER_PROFILE: 5 * 60,      // 5 minutes
  HADITH: 24 * 60 * 60,      // 24 hours
  QURAN: 7 * 24 * 60 * 60,   // 7 days (immutable Quran text)
  FEED: 60,                   // 1 minute
  TRENDING: 5 * 60,           // 5 minutes
  FOLLOWER_COUNT: 5 * 60,     // 5 minutes
  NOTIFICATION_COUNT: 60,     // 1 minute
  SESSION: 7 * 24 * 60 * 60,  // 7 days (refresh token TTL)
};

// ── Core get / set / del ──────────────────────────────

/**
 * Get a value from Redis cache.
 * Returns parsed JSON, or null if key doesn't exist or Redis is down.
 */
export async function cacheGet(key) {
  if (!isRedisConnected()) return null;
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Set a value in Redis cache with TTL.
 * @param {string} key
 * @param {*} value — will be JSON.stringify'd
 * @param {number} ttl — seconds (default 5 min)
 */
export async function cacheSet(key, value, ttl = TTL.USER_PROFILE) {
  if (!isRedisConnected()) return;
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // Silently fail — cache is an optimisation
  }
}

/**
 * Delete one or more keys from cache (invalidation).
 * Accepts a single key string or an array of keys.
 */
export async function cacheDel(keys) {
  if (!isRedisConnected()) return;
  try {
    const client = getRedisClient();
    const keyArray = Array.isArray(keys) ? keys : [keys];
    if (keyArray.length > 0) {
      await client.del(...keyArray);
    }
  } catch {
    // Silently fail
  }
}

/**
 * Delete all keys matching a pattern (e.g. "feed:userId:*").
 * Uses SCAN to avoid blocking Redis.
 */
export async function cacheDelPattern(pattern) {
  if (!isRedisConnected()) return;
  try {
    const client = getRedisClient();
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Silently fail
  }
}

// ── Domain-specific helpers ───────────────────────────

/** Cache a user profile (write-through). */
export async function cacheUserProfile(user) {
  if (!user?._id) return;
  await cacheSet(`user:${user._id}`, user, TTL.USER_PROFILE);
}

/** Get cached user profile. */
export async function getCachedUserProfile(userId) {
  return cacheGet(`user:${userId}`);
}

/** Invalidate all caches for a user (profile, feed, counts). */
export async function invalidateUserCache(userId) {
  await cacheDel([
    `user:${userId}`,
    `notification:unread:${userId}`,
  ]);
  await cacheDelPattern(`feed:${userId}:*`);
}

/** Cache feed page. */
export async function cacheFeedPage(userId, tab, page, data) {
  await cacheSet(`feed:${userId}:${tab}:${page}`, data, TTL.FEED);
}

/** Get cached feed page. */
export async function getCachedFeedPage(userId, tab, page) {
  return cacheGet(`feed:${userId}:${tab}:${page}`);
}

/** Invalidate feed cache for a user (e.g. after new post). */
export async function invalidateFeedCache(userId) {
  await cacheDelPattern(`feed:${userId}:*`);
}

/** Cache trending hashtags. */
export async function cacheTrending(data) {
  await cacheSet("trending:hashtags", data, TTL.TRENDING);
}

/** Get cached trending hashtags. */
export async function getCachedTrending() {
  return cacheGet("trending:hashtags");
}

/** Cache unread notification count. */
export async function cacheNotificationCount(userId, count) {
  await cacheSet(`notification:unread:${userId}`, count, TTL.NOTIFICATION_COUNT);
}

/** Get cached unread notification count. */
export async function getCachedNotificationCount(userId) {
  return cacheGet(`notification:unread:${userId}`);
}

// ── Session / refresh token management ────────────────

/**
 * Store a refresh token in Redis for fast lookup + revocation.
 * Key: session:{userId}:{tokenId}
 */
export async function storeRefreshToken(userId, tokenId, ttl = TTL.SESSION) {
  await cacheSet(`session:${userId}:${tokenId}`, { userId, createdAt: Date.now() }, ttl);
}

/**
 * Check if a refresh token is still valid (not revoked).
 */
export async function isRefreshTokenValid(userId, tokenId) {
  const data = await cacheGet(`session:${userId}:${tokenId}`);
  return data !== null;
}

/**
 * Revoke a specific refresh token (logout single device).
 */
export async function revokeRefreshToken(userId, tokenId) {
  await cacheDel(`session:${userId}:${tokenId}`);
}

/**
 * Revoke all refresh tokens for a user (logout all devices).
 */
export async function revokeAllRefreshTokens(userId) {
  await cacheDelPattern(`session:${userId}:*`);
}
