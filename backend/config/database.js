import mongoose from "mongoose";
import logger from "./logger.js";

const databaseConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ── Connection pool ─────────────────────────
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || "10", 10),
      minPoolSize: 2,
      // ── Timeouts ────────────────────────────────
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // ── Write concern ───────────────────────────
      w: "majority",
    });
    logger.info("✅ MongoDB connected", {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });

    // ── Connection event monitoring ──────────────
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error("Database connection failed", { error: error.message });
    process.exit(1);
  }
};

export default databaseConnection;