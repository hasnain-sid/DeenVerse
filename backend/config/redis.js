import Redis from "ioredis";

/**
 * Redis client singleton.
 *
 * Connection priority:
 *   1. REDIS_URL  (e.g. redis://user:pass@host:6379)
 *   2. REDIS_HOST + REDIS_PORT + REDIS_PASSWORD
 *   3. Falls back to a graceful "no-op" stub so the app works without Redis.
 */

let client = null;
let isConnected = false;

/**
 * Create (or return existing) Redis client.
 */
export function getRedisClient() {
  if (client) return client;

  const url = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  try {
    if (url) {
      client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy: retryStrategy,
        lazyConnect: true,
      });
    } else {
      client = new Redis({
        host,
        port,
        password,
        maxRetriesPerRequest: 3,
        retryStrategy: retryStrategy,
        lazyConnect: true,
      });
    }

    client.on("connect", () => {
      isConnected = true;
      console.log("✅ Redis connected");
    });

    client.on("error", (err) => {
      // Don't crash the app — Redis is an optimization layer
      if (isConnected) {
        console.warn("⚠️  Redis error:", err.message);
      }
    });

    client.on("close", () => {
      isConnected = false;
    });

    // Attempt connection (non-blocking)
    client.connect().catch(() => {
      console.warn("⚠️  Redis not available — caching disabled (app continues without it)");
      client = null;
    });
  } catch {
    console.warn("⚠️  Redis not configured — caching disabled");
    client = null;
  }

  return client;
}

function retryStrategy(times) {
  if (times > 5) return null; // Stop retrying after 5 attempts
  return Math.min(times * 200, 3000); // Exponential backoff up to 3s
}

/**
 * Whether Redis is currently connected and usable.
 */
export function isRedisConnected() {
  return isConnected && client !== null;
}

/**
 * Gracefully close Redis on shutdown.
 */
export async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
    isConnected = false;
  }
}
