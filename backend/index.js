import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import databaseConnection from "./config/database.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import collectionRoute from "./routes/collectionRoute.js";
import postRoute from "./routes/postRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import chatRoute from "./routes/chatRoute.js";
import streamRoute from "./routes/streamRoute.js";
import pushRoute from "./routes/pushRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import { initSocket } from "./socket/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: join(__dirname, ".env"),
});
databaseConnection();
const app = express();

// Create HTTP server (needed for Socket.IO)
const httpServer = createServer(app);

// middleware
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Determine CORS origin based on environment
const productionFrontendURL =
  process.env.FRONTEND_URL_PROD || "https://deen-verse-front.vercel.app";

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [productionFrontendURL]
    : ["http://localhost:3000", "http://localhost:3001", productionFrontendURL];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ── Initialise Socket.IO ─────────────────────────────
initSocket(httpServer, corsOptions);

// ── REST API routes ──────────────────────────────────
app.use("/api/v1/user", userRoute);
app.use("/api/v1/collections", collectionRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/streams", streamRoute);
app.use("/api/v1/push", pushRoute);
app.use("/api/v1/upload", uploadRoute);

// Centralized Error Handler
// This should be defined AFTER all other app.use() and routes calls
app.use(errorHandler);

// Use httpServer.listen instead of app.listen for Socket.IO support
httpServer.listen(process.env.PORT, () => {
  console.log(`Server is listening at port ${process.env.PORT}`);
  console.log(`Socket.IO ready on the same port`);
});