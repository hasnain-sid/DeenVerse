import { AppError } from "../utils/AppError.js";
import {
  createClassroom,
  browseClassrooms,
  getClassroomById,
  getUpcomingClassrooms,
  getMySessions,
  updateClassroom,
  deleteClassroom,
  startClassroom,
  joinClassroom,
  endClassroom,
  leaveClassroom,
  muteParticipant,
  kickParticipant,
  updateClassroomSettings,
  startRecording,
  stopRecording,
  getRecordings,
  saveWhiteboardSnapshot,
  getWhiteboardSnapshot,
} from "../services/classroomService.js";

// ── Create ───────────────────────────────────────────

export const createClassroomHandler = async (req, res, next) => {
  try {
    const result = await createClassroom(req.user, req.body);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Browse ───────────────────────────────────────────

export const browseClassroomsHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filters = {
      status: req.query.status,
      course: req.query.course,
      type: req.query.type,
      search: req.query.search,
      page,
      limit,
    };

    const result = await browseClassrooms(filters);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Upcoming ─────────────────────────────────────────

export const getUpcomingClassroomsHandler = async (req, res, next) => {
  try {
    const result = await getUpcomingClassrooms(req.query.course);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── My Sessions ──────────────────────────────────────

export const getMySessionsHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const role = req.query.role || undefined;
    const status = req.query.status || undefined;

    const result = await getMySessions(req.user, role, status, page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Detail ───────────────────────────────────────────

export const getClassroomByIdHandler = async (req, res, next) => {
  try {
    const result = await getClassroomById(req.params.classroomId, req.user || null);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Update ───────────────────────────────────────────

export const updateClassroomHandler = async (req, res, next) => {
  try {
    const result = await updateClassroom(req.user, req.params.classroomId, req.body);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Delete ───────────────────────────────────────────

export const deleteClassroomHandler = async (req, res, next) => {
  try {
    const result = await deleteClassroom(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Start ────────────────────────────────────────────

export const startClassroomHandler = async (req, res, next) => {
  try {
    const result = await startClassroom(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Join ─────────────────────────────────────────────

export const joinClassroomHandler = async (req, res, next) => {
  try {
    const result = await joinClassroom(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── End ──────────────────────────────────────────────

export const endClassroomHandler = async (req, res, next) => {
  try {
    const result = await endClassroom(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Leave ────────────────────────────────────────────

export const leaveClassroomHandler = async (req, res, next) => {
  try {
    const result = await leaveClassroom(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Mute Participant ────────────────────────────────

export const muteParticipantHandler = async (req, res, next) => {
  try {
    const result = await muteParticipant(
      req.user,
      req.params.classroomId,
      req.params.participantId,
      req.body
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Kick Participant ────────────────────────────────

export const kickParticipantHandler = async (req, res, next) => {
  try {
    const result = await kickParticipant(
      req.user,
      req.params.classroomId,
      req.params.participantId,
      req.body.reason
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Update Settings ─────────────────────────────────

export const updateSettingsHandler = async (req, res, next) => {
  try {
    const result = await updateClassroomSettings(
      req.user,
      req.params.classroomId,
      req.body
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Start Recording ─────────────────────────────────

export const startRecordingHandler = async (req, res, next) => {
  try {
    const result = await startRecording(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Stop Recording ──────────────────────────────────

export const stopRecordingHandler = async (req, res, next) => {
  try {
    const result = await stopRecording(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Get Recordings ──────────────────────────────────

export const getRecordingsHandler = async (req, res, next) => {
  try {
    const result = await getRecordings(req.user, req.params.classroomId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Save Whiteboard Snapshot ────────────────────────

export const saveWhiteboardSnapshotHandler = async (req, res, next) => {
  try {
    const result = await saveWhiteboardSnapshot(
      req.user,
      req.params.classroomId,
      req.body.snapshot
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Get Whiteboard Snapshot ─────────────────────────

export const getWhiteboardSnapshotHandler = async (req, res, next) => {
  try {
    const result = await getWhiteboardSnapshot(
      req.user,
      req.params.classroomId
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};
