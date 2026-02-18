import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

/**
 * In-memory map of userId → Set<socketId>.
 * A single user may be connected from multiple tabs/devices.
 */
const onlineUsers = new Map(); // userId → Set<socketId>

/**
 * Get the Socket.IO server instance.
 * Set after initSocket() is called.
 */
let io = null;

/**
 * Initialise Socket.IO on an existing HTTP server.
 *
 * @param {import("http").Server} httpServer
 * @param {object} corsOptions — reuse the same CORS config as Express
 * @returns {import("socket.io").Server}
 */
export function initSocket(httpServer, corsOptions) {
  io = new Server(httpServer, {
    cors: corsOptions,
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ["websocket", "polling"],
  });

  // ── Auth middleware — verify JWT before allowing connection ──
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1] ||
        parseCookie(socket.handshake.headers?.cookie, "refreshToken");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      if (!process.env.TOKEN_SECRET) return next(new Error("Server configuration error"));

      let decoded;
      const isFromCookie = !socket.handshake.auth?.token && !socket.handshake.headers?.authorization;
      try {
        // Cookie tokens are refresh tokens — use refresh secret
        // Auth header/handshake tokens are access tokens — use access secret
        const secret = isFromCookie
          ? (process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET)
          : process.env.TOKEN_SECRET;
        decoded = jwt.verify(token, secret);
      } catch {
        return next(new Error("Invalid or expired token"));
      }

      // Attach userId to the socket for later use
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ─────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`⚡ Socket connected: ${socket.id} (user: ${userId})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Let everyone know this user is online
    socket.broadcast.emit("user:online", { userId });

    // ─── Join personal room (for targeted events) ───
    socket.join(`user:${userId}`);

    // ─── Client requests: who is online? ────────────
    socket.on("users:online", (userIds, callback) => {
      if (typeof callback !== "function") return;
      const statuses = {};
      for (const uid of userIds) {
        statuses[uid] = onlineUsers.has(uid);
      }
      callback(statuses);
    });

    // ─── Chat: join a conversation room ─────────────
    socket.on("chat:join", (conversationId) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on("chat:leave", (conversationId) => {
      socket.leave(`chat:${conversationId}`);
    });

    // ─── Chat: typing indicators ────────────────────
    socket.on("chat:typing", ({ conversationId, isTyping }) => {
      socket
        .to(`chat:${conversationId}`)
        .emit("chat:typing", { userId, isTyping, conversationId });
    });

    // ─── Stream: join a live stream room ────────────
    socket.on("stream:join", (streamId) => {
      socket.join(`stream:${streamId}`);
      // Broadcast updated viewer count
      const room = io.sockets.adapter.rooms.get(`stream:${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream:${streamId}`).emit("stream:viewers", {
        streamId,
        viewerCount,
      });
    });

    socket.on("stream:leave", (streamId) => {
      socket.leave(`stream:${streamId}`);
      const room = io.sockets.adapter.rooms.get(`stream:${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream:${streamId}`).emit("stream:viewers", {
        streamId,
        viewerCount,
      });
    });

    // ─── Stream: live chat message ──────────────────
    socket.on("stream:chat", async ({ streamId, content }) => {
      if (!content || content.trim().length === 0) return;

      try {
        const user = await User.findById(userId).select(
          "name username avatar"
        );
        if (!user) return;

        io.to(`stream:${streamId}`).emit("stream:chat", {
          _id: `${Date.now()}-${socket.id}`,
          sender: {
            _id: userId,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
          content: content.trim().slice(0, 300),
          streamId,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Silently ignore chat errors
      }
    });

    // ─── Disconnect ─────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (user: ${userId})`);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          // User is fully offline — notify others
          socket.broadcast.emit("user:offline", { userId });
        }
      }
    });
  });

  return io;
}

/**
 * Get the initialised Socket.IO server instance.
 * Call after initSocket().
 */
export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialised. Call initSocket() first.");
  }
  return io;
}

/**
 * Check if a specific user is currently online.
 */
export function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

/**
 * Get all currently online user IDs.
 */
export function getOnlineUserIds() {
  return [...onlineUsers.keys()];
}

// ── Helper: parse a specific cookie from the raw cookie header ──
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
