import express from "express";
import mongoose from "mongoose";
import { isRedisConnected, getRedisClient } from "../config/redis.js";

const router = express.Router();

/**
 * GET /health
 * Basic health check — always responds 200 if the process is alive.
 */
router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/db
 * MongoDB connection status.
 */
router.get("/db", async (_req, res) => {
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const stateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

    if (state !== 1) {
      return res.status(503).json({
        status: "error",
        service: "mongodb",
        state: stateMap[state] || "unknown",
      });
    }

    // Quick ping to verify the connection is truly live
    await mongoose.connection.db.admin().ping();

    res.json({
      status: "ok",
      service: "mongodb",
      state: "connected",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      service: "mongodb",
      message: err.message,
    });
  }
});

/**
 * GET /health/redis
 * Redis connection status.
 */
router.get("/redis", async (_req, res) => {
  if (!isRedisConnected()) {
    return res.status(503).json({
      status: "unavailable",
      service: "redis",
      message: "Redis is not connected (caching disabled)",
    });
  }

  try {
    const client = getRedisClient();
    const pong = await client.ping();
    const info = await client.info("server");
    const versionMatch = info.match(/redis_version:(.+)/);

    res.json({
      status: "ok",
      service: "redis",
      ping: pong,
      version: versionMatch ? versionMatch[1].trim() : "unknown",
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      service: "redis",
      message: err.message,
    });
  }
});

/**
 * GET /health/full
 * Comprehensive check of all services.
 */
router.get("/full", async (_req, res) => {
  const checks = {};
  let overallStatus = "ok";

  // MongoDB
  try {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      await mongoose.connection.db.admin().ping();
      checks.mongodb = { status: "ok" };
    } else {
      checks.mongodb = { status: "error", state };
      overallStatus = "degraded";
    }
  } catch (err) {
    checks.mongodb = { status: "error", message: err.message };
    overallStatus = "error";
  }

  // Redis
  if (isRedisConnected()) {
    try {
      await getRedisClient().ping();
      checks.redis = { status: "ok" };
    } catch (err) {
      checks.redis = { status: "error", message: err.message };
      overallStatus = "degraded";
    }
  } else {
    checks.redis = { status: "unavailable", message: "Not configured" };
    // Redis is optional — don't degrade overall status
  }

  const statusCode = overallStatus === "error" ? 503 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
  });
});

export default router;
