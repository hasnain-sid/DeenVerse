import crypto from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";
import { s3, S3_BUCKETS } from "../config/aws.js";
import * as livekitService from "./livekitService.js";

// ── Helpers ──────────────────────────────────────────

let _cachedAdminIds = null;

function getAdminIds() {
  if (!_cachedAdminIds) {
    _cachedAdminIds = (process.env.ADMIN_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return _cachedAdminIds;
}

function isAdmin(userId) {
  const adminIds = getAdminIds();
  return adminIds.includes(userId.toString());
}

const HOST_POPULATE = "name username avatar scholarProfile";

// ── Create Classroom ─────────────────────────────────

export async function createClassroom(userId, data) {
  const livekitRoomName = `cls_${crypto.randomUUID()}`;

  const classroomData = {
    ...data,
    host: userId,
    livekitRoomName,
  };

  // If courseSlug is provided, look up course and verify instructor ownership
  if (data.courseSlug) {
    const course = await Course.findOne({ slug: data.courseSlug }).lean();
    if (!course) {
      throw new AppError("Course not found", 404);
    }
    if (course.instructor.toString() !== userId.toString() && !isAdmin(userId)) {
      throw new AppError("Only the course instructor can create a classroom for this course", 403);
    }
    classroomData.course = course._id;
    delete classroomData.courseSlug;
  }

  const classroom = await new Classroom(classroomData).save();

  const populated = await Classroom.findById(classroom._id)
    .populate("host", HOST_POPULATE)
    .lean();

  return { classroom: populated };
}

// ── Browse Classrooms ────────────────────────────────

export async function browseClassrooms(filters) {
  const {
    status,
    course: courseSlug,
    type,
    search,
    page = 1,
    limit = 12,
  } = filters;

  const query = { status: { $in: ["live", "scheduled"] } };

  // Override with specific status if provided
  if (status && ["live", "scheduled"].includes(status)) {
    query.status = status;
  }

  if (type) query.type = type;

  // Filter by course slug
  if (courseSlug) {
    const course = await Course.findOne({ slug: courseSlug }).select("_id").lean();
    if (course) {
      query.course = course._id;
    } else {
      // Course not found — return empty results
      return { classrooms: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  // Text search on title
  if (search) {
    const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.title = { $regex: sanitized, $options: "i" };
  }

  const skip = (page - 1) * limit;

  // Sort: live classrooms first, then scheduled by scheduledAt asc
  const sortOption = { status: 1, scheduledAt: 1 };
  // status: 1 puts "live" before "scheduled" alphabetically

  const [classrooms, total] = await Promise.all([
    Classroom.find(query)
      .populate("host", HOST_POPULATE)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Classroom.countDocuments(query),
  ]);

  return {
    classrooms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Get Classroom By ID ──────────────────────────────

export async function getClassroomById(classroomId, userId) {
  const classroom = await Classroom.findById(classroomId)
    .populate("host", HOST_POPULATE)
    .lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  const isHost = userId && classroom.host._id.toString() === userId.toString();

  // If course-only access and user is not the host, check enrollment
  if (classroom.access === "course-only" && classroom.course && !isHost) {
    if (!userId) {
      throw new AppError("Authentication required to access this classroom", 401);
    }
    const enrolled = await Enrollment.findOne({
      student: userId,
      course: classroom.course,
      status: "active",
    }).lean();
    if (!enrolled && !isAdmin(userId)) {
      throw new AppError("You must be enrolled in the course to access this classroom", 403);
    }
  }

  return { classroom, isHost: !!isHost };
}

// ── Get Upcoming Classrooms ──────────────────────────

export async function getUpcomingClassrooms(courseSlug) {
  const query = {
    status: "scheduled",
    scheduledAt: { $gt: new Date() },
  };

  if (courseSlug) {
    const course = await Course.findOne({ slug: courseSlug }).select("_id").lean();
    if (course) {
      query.course = course._id;
    } else {
      return { classrooms: [] };
    }
  }

  const classrooms = await Classroom.find(query)
    .populate("host", HOST_POPULATE)
    .sort({ scheduledAt: 1 })
    .limit(20)
    .lean();

  return { classrooms };
}

// ── Get My Sessions ──────────────────────────────────

export async function getMySessions(userId, role, status, page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  let query;

  if (role === "host") {
    // Classrooms where the user is the host
    query = { host: userId };
  } else {
    // Student sessions: classrooms the user has joined OR
    // scheduled classrooms linked to courses where user is enrolled
    const [participantRecords, enrollments] = await Promise.all([
      ClassroomParticipant.find({ user: userId }).select("classroom").lean(),
      Enrollment.find({ student: userId, status: "active" }).select("course").lean(),
    ]);

    const joinedClassroomIds = participantRecords.map((p) => p.classroom);
    const enrolledCourseIds = enrollments.map((e) => e.course);

    query = {
      $or: [
        { _id: { $in: joinedClassroomIds } },
        { course: { $in: enrolledCourseIds }, status: "scheduled" },
      ],
    };
  }

  // Filter by status if provided
  if (status && ["live", "scheduled", "ended"].includes(status)) {
    if (query.$or) {
      // Wrap existing $or with status constraint
      query = { $and: [query, { status }] };
    } else {
      query.status = status;
    }
  }

  const [classrooms, total] = await Promise.all([
    Classroom.find(query)
      .populate("host", HOST_POPULATE)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Classroom.countDocuments(query),
  ]);

  return {
    classrooms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Update Classroom ─────────────────────────────────

export async function updateClassroom(userId, classroomId, data) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Verify ownership
  const isHost = classroom.host.toString() === userId.toString();
  if (!isHost && !isAdmin(userId)) {
    throw new AppError("Only the host can update this classroom", 403);
  }

  // Cannot update certain fields on a live classroom
  if (classroom.status === "live") {
    if (data.scheduledAt !== undefined || data.type !== undefined) {
      throw new AppError("Cannot change scheduledAt or type while classroom is live", 400);
    }
  }

  // Apply allowed updates
  const allowedFields = [
    "title", "description", "scheduledAt", "duration", "maxParticipants",
    "type", "settings", "access", "tags", "thumbnail", "timezone",
  ];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      classroom[field] = data[field];
    }
  }

  await classroom.save();

  const updated = await Classroom.findById(classroom._id)
    .populate("host", HOST_POPULATE)
    .lean();

  return { classroom: updated };
}

// ── Delete Classroom ─────────────────────────────────

export async function deleteClassroom(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Verify ownership
  const isHost = classroom.host.toString() === userId.toString();
  if (!isHost && !isAdmin(userId)) {
    throw new AppError("Only the host can delete this classroom", 403);
  }

  if (classroom.status === "live") {
    throw new AppError("Cannot delete a live classroom. End the session first.", 400);
  }

  if (classroom.status === "scheduled") {
    // Hard delete — session never happened
    await Classroom.deleteOne({ _id: classroomId });
    return { message: "Classroom deleted" };
  }

  // Ended classrooms: soft delete to preserve recordings/history
  classroom.deletedAt = new Date();
  await classroom.save();

  return { message: "Classroom archived" };
}

// ── Start Classroom ──────────────────────────────────

export async function startClassroom(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.host.toString() !== userId.toString()) {
    throw new AppError("Only the host can start this classroom", 403);
  }

  if (classroom.status !== "scheduled") {
    throw new AppError(
      classroom.status === "live"
        ? "Classroom is already live"
        : "Classroom has already ended",
      400
    );
  }

  // Create LiveKit room
  const livekitRoom = await livekitService.createRoom(
    classroom.livekitRoomName,
    classroom.maxParticipants
  );

  // Generate host token
  const host = await User.findById(userId).select("name username").lean();
  const hostName = host?.name || host?.username || "Host";

  const livekitToken = await livekitService.generateToken(
    userId.toString(),
    hostName,
    classroom.livekitRoomName,
    { isHost: true, canPublish: true, canSubscribe: true, canPublishData: true }
  );

  // Update classroom status
  classroom.status = "live";
  classroom.startedAt = new Date();
  classroom.livekitRoomSid = livekitRoom.sid;
  classroom.participantCount = 1;
  classroom.peakParticipants = 1;
  classroom.participants = [userId];
  await classroom.save();

  // Create host participant record
  await ClassroomParticipant.findOneAndUpdate(
    { classroom: classroomId, user: userId },
    { classroom: classroomId, user: userId, role: "host", joinedAt: new Date(), leftAt: null, duration: null },
    { upsert: true, new: true }
  );

  // Emit Socket.IO event
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.emit("classroom:started", {
      classroomId: classroom._id,
      title: classroom.title,
      host: { _id: userId, name: hostName },
    });
  } catch {
    // Socket not initialised — skip silently
  }

  const populated = await Classroom.findById(classroomId)
    .populate("host", HOST_POPULATE)
    .lean();

  return {
    classroom: populated,
    livekitToken,
    serverUrl: process.env.LIVEKIT_URL,
  };
}

// ── Join Classroom ───────────────────────────────────

export async function joinClassroom(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId)
    .populate("host", "name username followers")
    .lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.status !== "live") {
    throw new AppError("This classroom is not currently live", 400);
  }

  // Check capacity (exclude host from count check)
  if (classroom.participants && classroom.participants.length >= classroom.maxParticipants) {
    throw new AppError("Classroom is full", 403);
  }

  // Access control
  if (classroom.access === "course-only" && classroom.course) {
    const enrolled = await Enrollment.findOne({
      student: userId,
      course: classroom.course,
      status: "active",
    }).lean();
    if (!enrolled && !isAdmin(userId)) {
      throw new AppError("You must be enrolled in the course to join this classroom", 403);
    }
  } else if (classroom.access === "followers") {
    const hostFollowers = classroom.host.followers || [];
    const isFollower = hostFollowers.some((f) => f.toString() === userId.toString());
    if (!isFollower && classroom.host._id.toString() !== userId.toString() && !isAdmin(userId)) {
      throw new AppError("You must follow the host to join this classroom", 403);
    }
  }
  // access === "public" → any authenticated user

  // Check if already a participant (reconnection case)
  const existingParticipant = await ClassroomParticipant.findOne({
    classroom: classroomId,
    user: userId,
  }).lean();

  // Generate participant token
  const user = await User.findById(userId).select("name username").lean();
  const userName = user?.name || user?.username || "Participant";

  const livekitToken = await livekitService.generateToken(
    userId.toString(),
    userName,
    classroom.livekitRoomName,
    {
      isHost: false,
      canPublish: !!(classroom.settings?.participantAudio || classroom.settings?.participantVideo),
      canSubscribe: true,
      canPublishData: !!classroom.settings?.whiteboardEnabled,
    }
  );

  if (existingParticipant) {
    // Reconnection — update joinedAt, clear leftAt
    await ClassroomParticipant.updateOne(
      { _id: existingParticipant._id },
      { joinedAt: new Date(), leftAt: null, duration: null }
    );
  } else {
    // New participant
    await ClassroomParticipant.create({
      classroom: classroomId,
      user: userId,
      role: "participant",
      joinedAt: new Date(),
    });
  }

  // Add to participants array + update count
  const updated = await Classroom.findByIdAndUpdate(
    classroomId,
    {
      $addToSet: { participants: userId },
      $inc: { participantCount: existingParticipant ? 0 : 1 },
    },
    { new: true }
  );

  // Update peak if needed
  if (updated && updated.participantCount > updated.peakParticipants) {
    await Classroom.updateOne(
      { _id: classroomId },
      { peakParticipants: updated.participantCount }
    );
  }

  const populated = await Classroom.findById(classroomId)
    .populate("host", HOST_POPULATE)
    .lean();

  return {
    livekitToken,
    serverUrl: process.env.LIVEKIT_URL,
    classroom: populated,
  };
}

// ── End Classroom ────────────────────────────────────

export async function endClassroom(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  const isHost = classroom.host.toString() === userId.toString();
  if (!isHost && !isAdmin(userId)) {
    throw new AppError("Only the host or an admin can end this classroom", 403);
  }

  if (classroom.status !== "live") {
    throw new AppError("Classroom is not live", 400);
  }

  // Delete LiveKit room
  await livekitService.deleteRoom(classroom.livekitRoomName);

  // Update all participant records
  const now = new Date();
  const participants = await ClassroomParticipant.find({
    classroom: classroomId,
    leftAt: null,
  });

  for (const p of participants) {
    const durationSecs = Math.round((now - p.joinedAt) / 1000);
    p.leftAt = now;
    p.duration = (p.duration || 0) + durationSecs;
    await p.save();
  }

  // Update classroom
  classroom.status = "ended";
  classroom.endedAt = now;
  classroom.participantCount = 0;
  await classroom.save();

  // Clear hand queue
  try {
    const { clearHandQueue } = await import("../socket/index.js");
    clearHandQueue(classroomId);
  } catch {
    // Socket not initialised — skip
  }

  // Emit Socket.IO event
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.emit("classroom:ended", {
      classroomId: classroom._id,
      title: classroom.title,
    });
  } catch {
    // Socket not initialised — skip silently
  }

  const populated = await Classroom.findById(classroomId)
    .populate("host", HOST_POPULATE)
    .lean();

  return { classroom: populated };
}

// ── Leave Classroom ──────────────────────────────────

const HOST_LEAVE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const hostLeaveTimers = new Map();

export async function leaveClassroom(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Update participant record
  const participant = await ClassroomParticipant.findOne({
    classroom: classroomId,
    user: userId,
    leftAt: null,
  });

  if (participant) {
    const now = new Date();
    const durationSecs = Math.round((now - participant.joinedAt) / 1000);
    participant.leftAt = now;
    participant.duration = (participant.duration || 0) + durationSecs;
    await participant.save();
  }

  // Remove from participants array + decrement count
  await Classroom.updateOne(
    { _id: classroomId, participantCount: { $gt: 0 } },
    {
      $pull: { participants: userId },
      $inc: { participantCount: -1 },
    }
  );

  // If host leaves, set auto-end timer
  const isHost = classroom.host.toString() === userId.toString();
  if (isHost && classroom.status === "live") {
    // Emit warning
    try {
      const { getIO } = await import("../socket/index.js");
      const io = getIO();
      io.emit("classroom:host-left", {
        classroomId: classroom._id,
        message: "Host has left. Classroom will auto-end in 5 minutes.",
      });
    } catch {
      // Socket not initialised — skip silently
    }

    // Clear existing timer if any
    if (hostLeaveTimers.has(classroomId.toString())) {
      clearTimeout(hostLeaveTimers.get(classroomId.toString()));
    }

    // Set 5-minute auto-end timer
    const timer = setTimeout(async () => {
      try {
        const current = await Classroom.findById(classroomId).lean();
        if (current && current.status === "live") {
          logger.info(`[Classroom] Auto-ending classroom ${classroomId} after host left`);
          await endClassroom(classroom.host, classroomId);
        }
      } catch (err) {
        logger.error(`[Classroom] Auto-end failed for ${classroomId}:`, err.message);
      } finally {
        hostLeaveTimers.delete(classroomId.toString());
      }
    }, HOST_LEAVE_TIMEOUT_MS);

    hostLeaveTimers.set(classroomId.toString(), timer);
  }

  return { message: "Left classroom" };
}

// ── Mute Participant ─────────────────────────────────

export async function muteParticipant(hostUserId, classroomId, participantUserId, { audio, video } = {}) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Verify caller is host
  if (classroom.host.toString() !== hostUserId.toString()) {
    throw new AppError("Only the host can mute participants", 403);
  }

  if (classroom.status !== "live") {
    throw new AppError("Classroom is not live", 400);
  }

  // Mute audio track if requested
  if (audio !== undefined) {
    await livekitService.muteParticipant(
      classroom.livekitRoomName,
      participantUserId.toString(),
      null,
      !!audio,
      "audio"
    );
  }

  // Mute video track if requested
  if (video !== undefined) {
    await livekitService.muteParticipant(
      classroom.livekitRoomName,
      participantUserId.toString(),
      null,
      !!video,
      "video"
    );
  }

  // Update participant record
  const updateFields = {};
  if (audio !== undefined) updateFields.isMuted = !!audio;
  if (video !== undefined) updateFields.isVideoOn = !video;

  if (Object.keys(updateFields).length > 0) {
    await ClassroomParticipant.updateOne(
      { classroom: classroomId, user: participantUserId },
      updateFields
    );
  }

  // Emit Socket.IO event to participant
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.to(`user:${participantUserId}`).emit("classroom:participant-muted", {
      classroomId,
      audio,
      video,
    });
  } catch {
    // Socket not initialised — skip
  }

  return { message: "Participant muted" };
}

// ── Kick Participant ─────────────────────────────────

export async function kickParticipant(hostUserId, classroomId, participantUserId, reason) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Verify caller is host or admin
  const isHost = classroom.host.toString() === hostUserId.toString();
  if (!isHost && !isAdmin(hostUserId)) {
    throw new AppError("Only the host or an admin can kick participants", 403);
  }

  if (classroom.status !== "live") {
    throw new AppError("Classroom is not live", 400);
  }

  // Remove from LiveKit room
  await livekitService.removeParticipant(
    classroom.livekitRoomName,
    participantUserId.toString()
  );

  // Update participant record — set leftAt
  const now = new Date();
  const participant = await ClassroomParticipant.findOne({
    classroom: classroomId,
    user: participantUserId,
    leftAt: null,
  });

  if (participant) {
    const durationSecs = Math.round((now - participant.joinedAt) / 1000);
    participant.leftAt = now;
    participant.duration = (participant.duration || 0) + durationSecs;
    await participant.save();
  }

  // Remove from classroom.participants + decrement count
  await Classroom.updateOne(
    { _id: classroomId, participantCount: { $gt: 0 } },
    {
      $pull: { participants: participantUserId },
      $inc: { participantCount: -1 },
    }
  );

  // Emit Socket.IO event to kicked participant
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.to(`user:${participantUserId}`).emit("classroom:participant-kicked", {
      classroomId,
      reason: reason || "Removed by host",
    });
    // Notify the room
    io.to(`classroom:${classroomId}`).emit("classroom:participant-left", {
      classroomId,
      userId: participantUserId,
      kicked: true,
    });
  } catch {
    // Socket not initialised — skip
  }

  return { message: "Participant kicked" };
}

// ── Update Classroom Settings ────────────────────────

export async function updateClassroomSettings(hostUserId, classroomId, settingsData) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Verify host
  if (classroom.host.toString() !== hostUserId.toString()) {
    throw new AppError("Only the host can update classroom settings", 403);
  }

  // Merge settings (only allowed keys)
  const allowedKeys = [
    "chatEnabled",
    "handRaiseEnabled",
    "participantVideo",
    "participantAudio",
    "whiteboardEnabled",
    "recordingEnabled",
    "autoAdmit",
  ];

  const current = classroom.settings || {};
  for (const key of allowedKeys) {
    if (settingsData[key] !== undefined) {
      current[key] = settingsData[key];
    }
  }
  classroom.settings = current;
  classroom.markModified("settings");
  await classroom.save();

  // Broadcast updated settings to all participants
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.to(`classroom:${classroomId}`).emit("classroom:settings-updated", {
      classroomId,
      settings: classroom.settings,
    });
  } catch {
    // Socket not initialised — skip
  }

  const populated = await Classroom.findById(classroomId)
    .populate("host", HOST_POPULATE)
    .lean();

  return { classroom: populated };
}

// ── Start Recording ──────────────────────────────────

export async function startRecording(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.host.toString() !== userId.toString()) {
    throw new AppError("Only the host can start recording", 403);
  }

  if (classroom.status !== "live") {
    throw new AppError("Classroom must be live to start recording", 400);
  }

  if (!classroom.settings?.recordingEnabled) {
    throw new AppError("Recording is not enabled for this classroom", 400);
  }

  if (classroom.activeEgressId) {
    throw new AppError("Recording is already in progress", 400);
  }

  const region = process.env.AWS_REGION || "us-east-1";
  const { egressId } = await livekitService.startRecording(classroom.livekitRoomName, {
    bucket: S3_BUCKETS.recordings,
    region,
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    prefix: `classrooms/${classroomId}/`,
  });

  classroom.activeEgressId = egressId;
  await classroom.save();

  // Broadcast consent banner to all participants
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.to(`classroom:${classroomId}`).emit("classroom:recording-started", {
      classroomId: classroom._id,
      egressId,
    });
  } catch {
    // Socket not initialised — skip
  }

  return { message: "Recording started", egressId };
}

// ── Stop Recording ───────────────────────────────────

export async function stopRecording(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.host.toString() !== userId.toString()) {
    throw new AppError("Only the host can stop recording", 403);
  }

  if (!classroom.activeEgressId) {
    throw new AppError("No active recording to stop", 400);
  }

  const egressId = classroom.activeEgressId;
  await livekitService.stopRecording(egressId);

  // Construct the S3 key pattern used by LiveKit Egress
  const s3Key = `classrooms/${classroomId}/${classroom.livekitRoomName}`;
  const recordingUrl = `https://${S3_BUCKETS.recordings}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;

  classroom.recordings.push({
    egressId,
    url: s3Key,
    createdAt: new Date(),
  });
  classroom.activeEgressId = null;
  await classroom.save();

  // Broadcast to all participants
  try {
    const { getIO } = await import("../socket/index.js");
    const io = getIO();
    io.to(`classroom:${classroomId}`).emit("classroom:recording-stopped", {
      classroomId: classroom._id,
      egressId,
    });
  } catch {
    // Socket not initialised — skip
  }

  return { recordingUrl };
}

// ── Get Recordings ───────────────────────────────────

export async function getRecordings(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId)
    .populate("host", "_id")
    .lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Check access: host, past participant, or enrolled student (course-only)
  const isHost = classroom.host._id.toString() === userId.toString();

  if (!isHost) {
    const wasParticipant = await ClassroomParticipant.exists({
      classroom: classroomId,
      user: userId,
    });

    if (!wasParticipant) {
      // Check enrollment for course-only classrooms
      if (classroom.access === "course-only" && classroom.course) {
        const enrolled = await Enrollment.findOne({
          student: userId,
          course: classroom.course,
          status: "active",
        }).lean();
        if (!enrolled && !isAdmin(userId)) {
          throw new AppError("You don't have access to these recordings", 403);
        }
      } else if (!isAdmin(userId)) {
        throw new AppError("You don't have access to these recordings", 403);
      }
    }
  }

  // Generate pre-signed URLs for each recording (1-hour expiry)
  const recordings = await Promise.all(
    (classroom.recordings || []).map(async (rec) => {
      let presignedUrl = null;
      if (rec.url) {
        try {
          const command = new GetObjectCommand({
            Bucket: S3_BUCKETS.recordings,
            Key: rec.url,
          });
          presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } catch (err) {
          logger.error(`[Classroom] Failed to sign recording URL: ${err.message}`);
        }
      }
      return {
        egressId: rec.egressId,
        url: presignedUrl,
        duration: rec.duration,
        size: rec.size,
        createdAt: rec.createdAt,
      };
    })
  );

  return { recordings };
}

// ── Save Whiteboard Snapshot ─────────────────────────

export async function saveWhiteboardSnapshot(userId, classroomId, snapshot) {
  const classroom = await Classroom.findById(classroomId).populate("host", "_id").lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.status !== "live") {
    throw new AppError("Whiteboard snapshots can only be saved during a live session", 400);
  }

  const isHost = classroom.host._id.toString() === userId.toString();
  if (!isHost && !isAdmin(userId)) {
    throw new AppError("Only the host can save the whiteboard snapshot", 403);
  }

  await Classroom.updateOne(
    { _id: classroomId },
    { $set: { whiteboardSnapshot: snapshot } }
  );

  return { message: "Whiteboard snapshot saved" };
}

// ── Get Whiteboard Snapshot ──────────────────────────

export async function getWhiteboardSnapshot(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId)
    .select("whiteboardSnapshot host status access course participants")
    .populate("host", "_id")
    .lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  // Check access: host, participant, enrolled student, or admin
  const isHost = classroom.host._id.toString() === userId.toString();

  if (!isHost && !isAdmin(userId)) {
    const isParticipant = await ClassroomParticipant.exists({
      classroom: classroomId,
      user: userId,
    });

    if (!isParticipant) {
      if (classroom.access === "course-only" && classroom.course) {
        const enrolled = await Enrollment.findOne({
          student: userId,
          course: classroom.course,
          status: "active",
        }).lean();
        if (!enrolled) {
          throw new AppError("You don't have access to this whiteboard", 403);
        }
      } else {
        throw new AppError("You don't have access to this whiteboard", 403);
      }
    }
  }

  return { snapshot: classroom.whiteboardSnapshot || null };
}

// ── Clear Whiteboard Snapshot ────────────────────────

export async function clearWhiteboardSnapshot(userId, classroomId) {
  const classroom = await Classroom.findById(classroomId).populate("host", "_id").lean();

  if (!classroom) {
    throw new AppError("Classroom not found", 404);
  }

  if (classroom.status !== "live") {
    throw new AppError("Whiteboard can only be cleared during a live session", 400);
  }

  const isHost = classroom.host._id.toString() === userId.toString();
  if (!isHost && !isAdmin(userId)) {
    throw new AppError("Only the host can clear the whiteboard", 403);
  }

  await Classroom.updateOne(
    { _id: classroomId },
    { $unset: { whiteboardSnapshot: 1 } }
  );

  return { message: "Whiteboard cleared" };
}
