import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { Classroom } from "../models/classroomSchema.js";

/**
 * In-memory map of userId → Set<socketId>.
 * A single user may be connected from multiple tabs/devices.
 */
const onlineUsers = new Map(); // userId → Set<socketId>

/**
 * In-memory hand-raise queue per classroom.
 * classroomId → Array<{ userId, name, timestamp }>
 */
const handQueues = new Map();

/**
 * In-memory throttle tracker for whiteboard snapshot saves.
 * classroomId → lastSaveTimestamp (ms)
 */
const whiteboardSaveTimestamps = new Map();

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

    // ─── Classroom: join Socket.IO room ─────────────
    socket.on("classroom:join-room", ({ classroomId }) => {
      if (!classroomId) return;
      socket.join(`classroom:${classroomId}`);
    });

    // ─── Classroom: leave Socket.IO room ────────────
    socket.on("classroom:leave-room", ({ classroomId }) => {
      if (!classroomId) return;
      socket.leave(`classroom:${classroomId}`);
      // Clean up hand queue on leave
      const queue = handQueues.get(classroomId);
      if (queue) {
        const idx = queue.findIndex((h) => h.userId === userId);
        if (idx !== -1) queue.splice(idx, 1);
        if (queue.length === 0) handQueues.delete(classroomId);
      }
    });

    // ─── Classroom: chat message ────────────────────
    socket.on("classroom:message:send", async ({ classroomId, message }) => {
      if (!classroomId || !message || message.trim().length === 0) return;

      try {
        const user = await User.findById(userId).select("name username avatar");
        if (!user) return;

        const chatMessage = {
          id: `${Date.now()}-${socket.id}`,
          userId,
          name: user.name || user.username,
          avatar: user.avatar,
          text: message.trim().slice(0, 500),
          createdAt: new Date().toISOString(),
        };

        io.to(`classroom:${classroomId}`).emit("classroom:message:new", {
          classroomId,
          message: chatMessage,
        });
      } catch {
        // Silently ignore chat errors
      }
    });

    // ─── Classroom: raise hand ──────────────────────
    socket.on("classroom:raise-hand", async ({ classroomId }) => {
      if (!classroomId) return;

      if (!handQueues.has(classroomId)) {
        handQueues.set(classroomId, []);
      }
      const queue = handQueues.get(classroomId);

      // Don't add if already in queue
      if (queue.some((h) => h.userId === userId)) return;

      try {
        const user = await User.findById(userId).select("name username").lean();
        const name = user?.name || user?.username || "Unknown";

        queue.push({ userId, name, timestamp: Date.now() });

        // Broadcast hand queue to the classroom room (host will see it)
        io.to(`classroom:${classroomId}`).emit("classroom:hand-queue", {
          classroomId,
          queue,
        });
      } catch {
        // Silently ignore
      }
    });

    // ─── Classroom: lower hand ──────────────────────
    socket.on("classroom:lower-hand", ({ classroomId }) => {
      if (!classroomId) return;

      const queue = handQueues.get(classroomId);
      if (!queue) return;

      const idx = queue.findIndex((h) => h.userId === userId);
      if (idx !== -1) queue.splice(idx, 1);
      if (queue.length === 0) handQueues.delete(classroomId);

      io.to(`classroom:${classroomId}`).emit("classroom:hand-queue", {
        classroomId,
        queue: queue || [],
      });
    });

    // ─── Classroom: grant speak (host only) ─────────
    socket.on("classroom:grant-speak", ({ classroomId, userId: targetUserId }) => {
      if (!classroomId || !targetUserId) return;

      // Remove from hand queue
      const queue = handQueues.get(classroomId);
      if (queue) {
        const idx = queue.findIndex((h) => h.userId === targetUserId);
        if (idx !== -1) queue.splice(idx, 1);
        if (queue.length === 0) handQueues.delete(classroomId);

        // Broadcast updated queue
        io.to(`classroom:${classroomId}`).emit("classroom:hand-queue", {
          classroomId,
          queue: queue || [],
        });
      }

      // Notify the granted user
      io.to(`user:${targetUserId}`).emit("classroom:speak-granted", {
        classroomId,
      });
    });

    // ─── Classroom: whiteboard save (host, throttled) ───
    socket.on("classroom:whiteboard-save", async ({ classroomId, snapshot }) => {
      if (!classroomId || !snapshot) return;

      // Throttle: max once per 30s per classroom
      const now = Date.now();
      const lastSave = whiteboardSaveTimestamps.get(classroomId) || 0;
      if (now - lastSave < 30_000) return;

      try {
        const classroom = await Classroom.findById(classroomId)
          .select("host status")
          .lean();
        if (!classroom || classroom.status !== "live") return;
        if (classroom.host.toString() !== userId) return;

        whiteboardSaveTimestamps.set(classroomId, now);
        await Classroom.updateOne(
          { _id: classroomId },
          { $set: { whiteboardSnapshot: snapshot } }
        );
      } catch {
        // Silently ignore save errors
      }
    });

    // ─── Classroom: whiteboard load (participant requests snapshot) ─
    socket.on("classroom:whiteboard-load", async ({ classroomId }, callback) => {
      if (!classroomId || typeof callback !== "function") return;

      try {
        const classroom = await Classroom.findById(classroomId)
          .select("whiteboardSnapshot")
          .lean();
        callback({ snapshot: classroom?.whiteboardSnapshot || null });
      } catch {
        callback({ snapshot: null });
      }
    });

    // ─── Classroom: whiteboard clear (host only) ────────
    socket.on("classroom:whiteboard-clear", async ({ classroomId }) => {
      if (!classroomId) return;

      try {
        const classroom = await Classroom.findById(classroomId)
          .select("host status")
          .lean();
        if (!classroom || classroom.status !== "live") return;
        if (classroom.host.toString() !== userId) return;

        await Classroom.updateOne(
          { _id: classroomId },
          { $unset: { whiteboardSnapshot: 1 } }
        );

        // Broadcast clear to all participants in the room
        io.to(`classroom:${classroomId}`).emit("classroom:whiteboard-cleared", {
          classroomId,
        });
      } catch {
        // Silently ignore clear errors
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

/**
 * Clear the hand-raise queue for a classroom.
 * Called when a classroom session ends.
 */
export function clearHandQueue(classroomId) {
  handQueues.delete(String(classroomId));
}

/**
 * Get the current hand-raise queue for a classroom.
 */
export function getHandQueue(classroomId) {
  return handQueues.get(String(classroomId)) || [];
}

// ── Helper: parse a specific cookie from the raw cookie header ──
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
