import { Stream } from "../models/streamSchema.js";
import { AppError } from "../utils/AppError.js";
import { createIvsChannel } from "./ivsService.js";

/**
 * Create a new stream session.
 * Generates a unique stream key for the broadcaster.
 */
export async function createStream(
  userId,
  { title, description, category, scheduledFor, chatEnabled }
) {
  if (!title || title.trim().length === 0) {
    throw new AppError("Stream title is required", 400);
  }

  // Create an IVS channel (returns placeholder values if AWS IVS is not configured)
  const ivs = await createIvsChannel(userId, title.trim());

  const stream = await Stream.create({
    host: userId,
    title: title.trim(),
    description: description?.trim() || "",
    category: category || "other",
    streamKey: ivs.streamKeyValue,
    playbackUrl: ivs.playbackUrl,
    status: "scheduled",
    scheduledFor: scheduledFor || null,
    chatEnabled: chatEnabled !== false,
  });

  await stream.populate("host", "name username avatar");

  return stream;
}

/**
 * Get all currently live streams.
 */
export async function getLiveStreams({ page = 1, limit = 20, category } = {}) {
  const skip = (page - 1) * limit;
  const filter = { status: "live" };
  if (category) filter.category = category;

  const streams = await Stream.find(filter)
    .sort({ viewerCount: -1, startedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("host", "name username avatar")
    .select("-streamKey")
    .lean();

  const total = await Stream.countDocuments(filter);

  return { streams, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get a single stream by ID.
 */
export async function getStreamById(streamId, requesterId = null) {
  const stream = await Stream.findById(streamId)
    .populate("host", "name username avatar")
    .lean();

  if (!stream) throw new AppError("Stream not found", 404);

  // Only expose streamKey to the host — never to public viewers
  if (!requesterId || stream.host._id.toString() !== requesterId) {
    delete stream.streamKey;
  }

  return stream;
}

/**
 * Mark stream as live (called by host or webhook).
 */
export async function startStream(streamId, userId) {
  const stream = await Stream.findById(streamId);
  if (!stream) throw new AppError("Stream not found", 404);
  if (stream.host.toString() !== userId) {
    throw new AppError("Only the host can start this stream", 403);
  }
  if (stream.status === "live") {
    throw new AppError("Stream is already live", 400);
  }

  stream.status = "live";
  stream.startedAt = new Date();
  await stream.save();

  await stream.populate("host", "name username avatar");
  return stream;
}

/**
 * End a stream (called by host or webhook).
 */
export async function endStream(streamId, userId) {
  const stream = await Stream.findById(streamId);
  if (!stream) throw new AppError("Stream not found", 404);
  if (stream.host.toString() !== userId) {
    throw new AppError("Only the host can end this stream", 403);
  }

  stream.status = "ended";
  stream.endedAt = new Date();
  await stream.save();

  await stream.populate("host", "name username avatar");
  return stream;
}

/**
 * Get upcoming scheduled streams.
 */
export async function getScheduledStreams({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const streams = await Stream.find({
    status: "scheduled",
    scheduledFor: { $gte: new Date() },
  })
    .sort({ scheduledFor: 1 })
    .skip(skip)
    .limit(limit)
    .populate("host", "name username avatar")
    .select("-streamKey")
    .lean();

  const total = await Stream.countDocuments({
    status: "scheduled",
    scheduledFor: { $gte: new Date() },
  });

  return { streams, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get recorded streams (VOD).
 */
export async function getRecordings({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const streams = await Stream.find({ status: "ended" })
    .sort({ endedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("host", "name username avatar")
    .select("-streamKey")
    .lean();

  const total = await Stream.countDocuments({ status: "ended" });

  return { streams, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get streams hosted by a specific user.
 */
export async function getUserStreams(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const streams = await Stream.find({ host: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("host", "name username avatar")
    .lean();

  const total = await Stream.countDocuments({ host: userId });

  return { streams, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Update viewer count (called via Socket.IO).
 */
export async function updateViewerCount(streamId, viewerCount) {
  const stream = await Stream.findById(streamId);
  if (!stream) return;

  stream.viewerCount = viewerCount;
  if (viewerCount > stream.peakViewers) {
    stream.peakViewers = viewerCount;
  }
  await stream.save();
}
