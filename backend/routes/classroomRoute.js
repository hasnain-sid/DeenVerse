import express from "express";
import isAuthenticated, { optionalAuth } from "../config/auth.js";
import { isScholar } from "../middlewares/admin.js";
import {
  createClassroomHandler,
  browseClassroomsHandler,
  getUpcomingClassroomsHandler,
  getMySessionsHandler,
  getClassroomByIdHandler,
  updateClassroomHandler,
  deleteClassroomHandler,
  startClassroomHandler,
  joinClassroomHandler,
  endClassroomHandler,
  leaveClassroomHandler,
  muteParticipantHandler,
  kickParticipantHandler,
  updateSettingsHandler,
  startRecordingHandler,
  stopRecordingHandler,
  getRecordingsHandler,
  saveWhiteboardSnapshotHandler,
  getWhiteboardSnapshotHandler,
} from "../controller/classroomController.js";

const router = express.Router();

// ── Scholar routes ───────────────────────────────────
router.post("/", isAuthenticated, isScholar, createClassroomHandler);

// ── Static routes (BEFORE /:classroomId to avoid param collision) ─
router.get("/upcoming", getUpcomingClassroomsHandler);
router.get("/my-sessions", isAuthenticated, getMySessionsHandler);

// ── Public browse ────────────────────────────────────
router.get("/", browseClassroomsHandler);

// ── Param-based routes ───────────────────────────────
router.get("/:classroomId", optionalAuth, getClassroomByIdHandler);
router.put("/:classroomId", isAuthenticated, updateClassroomHandler);
router.delete("/:classroomId", isAuthenticated, deleteClassroomHandler);

// ── Lifecycle routes ─────────────────────────────────
router.post("/:classroomId/start", isAuthenticated, startClassroomHandler);
router.post("/:classroomId/join", isAuthenticated, joinClassroomHandler);
router.post("/:classroomId/end", isAuthenticated, endClassroomHandler);
router.post("/:classroomId/leave", isAuthenticated, leaveClassroomHandler);

// ── Controls routes ──────────────────────────────────
router.post("/:classroomId/mute/:participantId", isAuthenticated, muteParticipantHandler);
router.post("/:classroomId/kick/:participantId", isAuthenticated, kickParticipantHandler);
router.put("/:classroomId/settings", isAuthenticated, updateSettingsHandler);

// ── Recording routes ─────────────────────────────────
router.post("/:classroomId/recording/start", isAuthenticated, startRecordingHandler);
router.post("/:classroomId/recording/stop", isAuthenticated, stopRecordingHandler);
router.get("/:classroomId/recordings", isAuthenticated, getRecordingsHandler);

// ── Whiteboard routes ────────────────────────────────
router.put("/:classroomId/whiteboard", isAuthenticated, saveWhiteboardSnapshotHandler);
router.get("/:classroomId/whiteboard", isAuthenticated, getWhiteboardSnapshotHandler);

export default router;
