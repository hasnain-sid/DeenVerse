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
 * Socket.IO handshake auth — verify the JWT before allowing the connection.
 *
 * Access tokens only, from `handshake.auth.token` or an Authorization header. The
 * refresh cookie used to be accepted here, which made the handshake forgeable: a
 * browser attaches that cookie to a cross-site connection automatically, so any page
 * the user visited while logged in could open a socket as them. The client now waits
 * for an access token before connecting (frontend/src/lib/socket.ts).
 *
 * Exported for tests; wired up via io.use() in initSocket.
 * @param {import("socket.io").Socket} socket
 * @param {(err?: Error) => void} next
 */
export async function authenticateSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    if (!process.env.TOKEN_SECRET) return next(new Error("Server configuration error"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch {
      return next(new Error("Invalid or expired token"));
    }

    // Attach userId to the socket for later use
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}

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

  io.use(authenticateSocket);

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
    socket.on("classroom:join-room", async ({ classroomId }) => {
      if (!classroomId) return;

      try {
        // Fetch classroom with host info and course data
        const { Enrollment } = await import("../models/enrollmentSchema.js");
        const classroom = await Classroom.findById(classroomId)
          .populate("host", "followers")
          .populate("course", "_id")
          .lean();

        if (!classroom) {
          console.warn(`[Socket] Classroom ${classroomId} not found`);
          return;
        }

        // Apply the same access control as HTTP /join
        if (classroom.access === "course-only" && classroom.course) {
          const enrolled = await Enrollment.findOne({
            student: userId,
            course: classroom.course._id,
            status: "active",
          }).lean();
          if (!enrolled) {
            console.warn(`[Socket] User ${userId} not enrolled in course for classroom ${classroomId}`);
            return;
          }
        } else if (classroom.access === "followers") {
          const hostFollowers = classroom.host?.followers || [];
          const isFollower = hostFollowers.some((f) => f.toString() === userId.toString());
          const isHost = classroom.host._id.toString() === userId.toString();
          if (!isFollower && !isHost) {
            console.warn(`[Socket] User ${userId} not a follower for classroom ${classroomId}`);
            return;
          }
        }
        // access === "public" → allow (already authenticated via auth middleware)

        // Authorization passed, join the room
        socket.join(`classroom:${classroomId}`);
      } catch (err) {
        console.error("[Socket] Error joining classroom room:", err);
      }
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
    socket.on("classroom:grant-speak", async ({ classroomId, userId: targetUserId }) => {
      if (!classroomId || !targetUserId) return;

      try {
        // Verify caller is the host of this classroom
        const classroom = await Classroom.findById(classroomId);
        if (!classroom || classroom.host.toString() !== userId) {
          console.warn(`[Socket] Unauthorized speak grant attempt by ${userId} in classroom ${classroomId}`);
          return;
        }

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
      } catch (err) {
        console.error("[Socket] Error granting speak:", err);
      }
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
        const { Enrollment } = await import("../models/enrollmentSchema.js");
        const classroom = await Classroom.findById(classroomId)
          .select("whiteboardSnapshot access host course")
          .populate("host", "followers")
          .populate("course", "_id")
          .lean();

        if (!classroom) {
          callback({ snapshot: null });
          return;
        }

        // Apply access control before returning snapshot
        if (classroom.access === "course-only" && classroom.course) {
          const enrolled = await Enrollment.findOne({
            student: userId,
            course: classroom.course._id,
            status: "active",
          }).lean();
          if (!enrolled) {
            console.warn(`[Socket] User ${userId} not enrolled in course, denying whiteboard load for ${classroomId}`);
            callback({ snapshot: null });
            return;
          }
        } else if (classroom.access === "followers") {
          const hostFollowers = classroom.host?.followers || [];
          const isFollower = hostFollowers.some((f) => f.toString() === userId.toString());
          const isHost = classroom.host._id.toString() === userId.toString();
          if (!isFollower && !isHost) {
            console.warn(`[Socket] User ${userId} not a follower, denying whiteboard load for ${classroomId}`);
            callback({ snapshot: null });
            return;
          }
        }
        // access === "public" → allow (already authenticated via auth middleware)

        // Authorization passed, return snapshot
        callback({ snapshot: classroom?.whiteboardSnapshot || null });
      } catch (err) {
        console.error("[Socket] Error loading whiteboard:", err);
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
