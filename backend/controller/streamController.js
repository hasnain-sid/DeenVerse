import {
  createStream,
  getLiveStreams,
  getStreamById,
  startStream,
  endStream,
  getScheduledStreams,
  getRecordings,
  getUserStreams,
} from "../services/streamService.js";
import { getIO } from "../socket/index.js";

export const createStreamHandler = async (req, res, next) => {
  try {
    const stream = await createStream(req.user, req.body);
    return res.status(201).json({ success: true, stream });
  } catch (error) {
    next(error);
  }
};

export const getLiveStreamsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const data = await getLiveStreams({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getStreamHandler = async (req, res, next) => {
  try {
    // req.user may be undefined on public routes (no auth middleware)
    const stream = await getStreamById(req.params.id, req.user || null);
    return res.status(200).json({ success: true, stream });
  } catch (error) {
    next(error);
  }
};

export const startStreamHandler = async (req, res, next) => {
  try {
    const stream = await startStream(req.params.id, req.user);

    // Notify all users that a stream went live
    try {
      const io = getIO();
      io.emit("stream:live", {
        streamId: stream._id,
        host: stream.host,
        title: stream.title,
        category: stream.category,
      });
    } catch {
      // Socket might not be initialized
    }

    return res.status(200).json({ success: true, stream });
  } catch (error) {
    next(error);
  }
};

export const endStreamHandler = async (req, res, next) => {
  try {
    const stream = await endStream(req.params.id, req.user);

    // Notify stream room that it ended
    try {
      const io = getIO();
      io.to(`stream:${req.params.id}`).emit("stream:ended", {
        streamId: stream._id,
      });
    } catch {
      // Socket might not be initialized
    }

    return res.status(200).json({ success: true, stream });
  } catch (error) {
    next(error);
  }
};

export const getScheduledStreamsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getScheduledStreams({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getRecordingsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getRecordings({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getMyStreamsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getUserStreams(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
