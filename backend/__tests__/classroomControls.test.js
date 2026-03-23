import {
  muteParticipant,
  kickParticipant,
  updateClassroomSettings,
} from "../services/classroomService.js";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/classroomSchema.js", () => ({
  Classroom: Object.assign(jest.fn(), {
    findById: jest.fn(),
    updateOne: jest.fn(),
  }),
}));

jest.mock("../models/classroomParticipantSchema.js", () => ({
  ClassroomParticipant: {
    updateOne: jest.fn().mockResolvedValue({}),
    findOne: jest.fn(),
  },
}));

jest.mock("../models/courseSchema.js", () => ({
  Course: { findOne: jest.fn() },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: { findOne: jest.fn() },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn() },
}));

const mockMuteParticipant = jest.fn().mockResolvedValue(undefined);
const mockRemoveParticipant = jest.fn().mockResolvedValue(undefined);

jest.mock("../services/livekitService.js", () => ({
  muteParticipant: (...args) => mockMuteParticipant(...args),
  removeParticipant: (...args) => mockRemoveParticipant(...args),
}));

// Socket.IO mock
const mockEmit = jest.fn();
const mockTo = jest.fn(() => ({ emit: mockEmit }));
const mockGetIO = jest.fn(() => ({ to: mockTo }));

jest.mock("../socket/index.js", () => ({
  getIO: () => mockGetIO(),
}));

jest.mock("../config/redis.js", () => ({
  getRedisClient: jest.fn(),
  isRedisConnected: jest.fn().mockReturnValue(false),
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("../config/aws.js", () => ({
  s3: {},
  S3_BUCKETS: { recordings: "test-bucket" },
}));

jest.mock("../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

// ── Constants ───────────────────────────────────────────

const HOST_ID = "host123";
const PARTICIPANT_ID = "participant456";
const OTHER_ID = "other789";
const ADMIN_ID = "admin001";
const CLASSROOM_ID = "cls001";

const originalEnv = { ...process.env };

// ── Helpers ─────────────────────────────────────────────

function makeClassroomDoc(overrides = {}) {
  const doc = {
    _id: CLASSROOM_ID,
    host: { toString: () => HOST_ID },
    livekitRoomName: "cls_test-room",
    status: "live",
    participantCount: 2,
    participants: [PARTICIPANT_ID],
    settings: {
      chatEnabled: true,
      handRaiseEnabled: true,
      participantVideo: false,
      participantAudio: false,
      whiteboardEnabled: true,
      recordingEnabled: false,
      autoAdmit: true,
    },
    save: jest.fn().mockResolvedValue(undefined),
    markModified: jest.fn(),
    ...overrides,
  };
  return doc;
}

function chainQuery(resolvedValue) {
  const chain = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
}

// ─────────────────────────────────────────────────────────
// muteParticipant
// ─────────────────────────────────────────────────────────

describe("muteParticipant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can mute participant audio — delegates to LiveKit and updates record", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    const result = await muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true });

    expect(result.message).toBe("Participant muted");
    expect(mockMuteParticipant).toHaveBeenCalledWith(
      "cls_test-room",
      PARTICIPANT_ID,
      null,
      true,
      "audio"
    );
    expect(ClassroomParticipant.updateOne).toHaveBeenCalledWith(
      { classroom: CLASSROOM_ID, user: PARTICIPANT_ID },
      { isMuted: true }
    );
  });

  it("host can mute participant video — delegates to LiveKit", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { video: true });

    expect(mockMuteParticipant).toHaveBeenCalledWith(
      "cls_test-room",
      PARTICIPANT_ID,
      null,
      true,
      "video"
    );
    expect(ClassroomParticipant.updateOne).toHaveBeenCalledWith(
      { classroom: CLASSROOM_ID, user: PARTICIPANT_ID },
      { isVideoOn: false }
    );
  });

  it("host can mute both audio and video in one call", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true, video: true });

    expect(mockMuteParticipant).toHaveBeenCalledTimes(2);
    expect(ClassroomParticipant.updateOne).toHaveBeenCalledWith(
      { classroom: CLASSROOM_ID, user: PARTICIPANT_ID },
      { isMuted: true, isVideoOn: false }
    );
  });

  it("non-host gets 403", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await expect(
      muteParticipant(OTHER_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true })
    ).rejects.toThrow(AppError);

    await expect(
      muteParticipant(OTHER_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 400 when classroom is not live", async () => {
    const classroom = makeClassroomDoc({ status: "scheduled" });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(
      muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(
      muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("emits classroom:participant-muted via Socket.IO", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await muteParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, { audio: true });

    expect(mockTo).toHaveBeenCalledWith(`user:${PARTICIPANT_ID}`);
    expect(mockEmit).toHaveBeenCalledWith("classroom:participant-muted", {
      classroomId: CLASSROOM_ID,
      audio: true,
      video: undefined,
    });
  });
});

// ─────────────────────────────────────────────────────────
// kickParticipant
// ─────────────────────────────────────────────────────────

describe("kickParticipant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can kick participant — removes from LiveKit and updates record", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);
    Classroom.updateOne.mockResolvedValue({});

    const participant = {
      joinedAt: new Date(Date.now() - 60000),
      leftAt: null,
      duration: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    ClassroomParticipant.findOne.mockResolvedValue(participant);

    const result = await kickParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, "Disruptive behavior");

    expect(result.message).toBe("Participant kicked");
    expect(mockRemoveParticipant).toHaveBeenCalledWith("cls_test-room", PARTICIPANT_ID);
    expect(participant.leftAt).toBeTruthy();
    expect(participant.save).toHaveBeenCalled();
    expect(Classroom.updateOne).toHaveBeenCalledWith(
      { _id: CLASSROOM_ID, participantCount: { $gt: 0 } },
      {
        $pull: { participants: PARTICIPANT_ID },
        $inc: { participantCount: -1 },
      }
    );
  });

  it("admin can kick participant even if not host", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);
    Classroom.updateOne.mockResolvedValue({});
    ClassroomParticipant.findOne.mockResolvedValue(null);

    const result = await kickParticipant(ADMIN_ID, CLASSROOM_ID, PARTICIPANT_ID);

    expect(result.message).toBe("Participant kicked");
    expect(mockRemoveParticipant).toHaveBeenCalled();
  });

  it("non-host non-admin gets 403", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await expect(
      kickParticipant(OTHER_ID, CLASSROOM_ID, PARTICIPANT_ID)
    ).rejects.toThrow(AppError);

    await expect(
      kickParticipant(OTHER_ID, CLASSROOM_ID, PARTICIPANT_ID)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 400 when classroom is not live", async () => {
    const classroom = makeClassroomDoc({ status: "ended" });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(
      kickParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(
      kickParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("emits kick events via Socket.IO", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);
    Classroom.updateOne.mockResolvedValue({});
    ClassroomParticipant.findOne.mockResolvedValue(null);

    await kickParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID, "Spam");

    // Should emit to the kicked user
    expect(mockTo).toHaveBeenCalledWith(`user:${PARTICIPANT_ID}`);
    expect(mockEmit).toHaveBeenCalledWith("classroom:participant-kicked", {
      classroomId: CLASSROOM_ID,
      reason: "Spam",
    });
    // Should also emit to the room
    expect(mockTo).toHaveBeenCalledWith(`classroom:${CLASSROOM_ID}`);
    expect(mockEmit).toHaveBeenCalledWith("classroom:participant-left", {
      classroomId: CLASSROOM_ID,
      userId: PARTICIPANT_ID,
      kicked: true,
    });
  });

  it("uses default reason when none provided", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);
    Classroom.updateOne.mockResolvedValue({});
    ClassroomParticipant.findOne.mockResolvedValue(null);

    await kickParticipant(HOST_ID, CLASSROOM_ID, PARTICIPANT_ID);

    expect(mockEmit).toHaveBeenCalledWith("classroom:participant-kicked", {
      classroomId: CLASSROOM_ID,
      reason: "Removed by host",
    });
  });
});

// ─────────────────────────────────────────────────────────
// updateClassroomSettings
// ─────────────────────────────────────────────────────────

describe("updateClassroomSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can update settings — merges without replacing", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById
      .mockResolvedValueOnce(classroom) // first call in updateClassroomSettings
      .mockReturnValueOnce(chainQuery({ ...classroom, settings: { ...classroom.settings, chatEnabled: false } }));

    const result = await updateClassroomSettings(HOST_ID, CLASSROOM_ID, { chatEnabled: false });

    expect(classroom.settings.chatEnabled).toBe(false);
    // Other settings should remain unchanged
    expect(classroom.settings.handRaiseEnabled).toBe(true);
    expect(classroom.settings.whiteboardEnabled).toBe(true);
    expect(classroom.save).toHaveBeenCalled();
    expect(classroom.markModified).toHaveBeenCalledWith("settings");
    expect(result.classroom).toBeDefined();
  });

  it("only merges allowed keys — ignores unknown keys", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById
      .mockResolvedValueOnce(classroom)
      .mockReturnValueOnce(chainQuery(classroom));

    await updateClassroomSettings(HOST_ID, CLASSROOM_ID, {
      chatEnabled: false,
      dangerousKey: true,
    });

    expect(classroom.settings.chatEnabled).toBe(false);
    expect(classroom.settings.dangerousKey).toBeUndefined();
  });

  it("non-host gets 403", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await expect(
      updateClassroomSettings(OTHER_ID, CLASSROOM_ID, { chatEnabled: false })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(
      updateClassroomSettings(HOST_ID, CLASSROOM_ID, { chatEnabled: false })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("broadcasts settings-updated via Socket.IO", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById
      .mockResolvedValueOnce(classroom)
      .mockReturnValueOnce(chainQuery(classroom));

    await updateClassroomSettings(HOST_ID, CLASSROOM_ID, { recordingEnabled: true });

    expect(mockTo).toHaveBeenCalledWith(`classroom:${CLASSROOM_ID}`);
    expect(mockEmit).toHaveBeenCalledWith("classroom:settings-updated", {
      classroomId: CLASSROOM_ID,
      settings: classroom.settings,
    });
  });

  it("can update multiple settings at once", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById
      .mockResolvedValueOnce(classroom)
      .mockReturnValueOnce(chainQuery(classroom));

    await updateClassroomSettings(HOST_ID, CLASSROOM_ID, {
      chatEnabled: false,
      participantVideo: true,
      recordingEnabled: true,
    });

    expect(classroom.settings.chatEnabled).toBe(false);
    expect(classroom.settings.participantVideo).toBe(true);
    expect(classroom.settings.recordingEnabled).toBe(true);
    // Untouched settings remain
    expect(classroom.settings.handRaiseEnabled).toBe(true);
    expect(classroom.settings.autoAdmit).toBe(true);
  });
});
