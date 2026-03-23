import {
  startRecording,
  stopRecording,
  getRecordings,
} from "../services/classroomService.js";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/classroomSchema.js", () => ({
  Classroom: Object.assign(jest.fn(), {
    findById: jest.fn(),
  }),
}));

jest.mock("../models/classroomParticipantSchema.js", () => ({
  ClassroomParticipant: {
    exists: jest.fn(),
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

const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();

jest.mock("../services/livekitService.js", () => ({
  startRecording: (...args) => mockStartRecording(...args),
  stopRecording: (...args) => mockStopRecording(...args),
}));

jest.mock("../socket/index.js", () => ({
  getIO: () => ({ to: jest.fn(() => ({ emit: jest.fn() })) }),
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
  S3_BUCKETS: { recordings: "deenverse-recordings" },
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://signed-url.example.com/recording.mp4"),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  GetObjectCommand: jest.fn(),
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
const EGRESS_ID = "egress-abc-123";

const originalEnv = { ...process.env };

// ── Helpers ─────────────────────────────────────────────

function makeClassroomDoc(overrides = {}) {
  const doc = {
    _id: CLASSROOM_ID,
    host: { toString: () => HOST_ID },
    livekitRoomName: "cls_test-room",
    status: "live",
    settings: { recordingEnabled: true },
    activeEgressId: null,
    recordings: [],
    save: jest.fn().mockResolvedValue(undefined),
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
// startRecording
// ─────────────────────────────────────────────────────────

describe("startRecording", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID, AWS_REGION: "us-east-1" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host starts recording on live classroom with recording enabled", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);
    mockStartRecording.mockResolvedValue({ egressId: EGRESS_ID });

    const result = await startRecording(HOST_ID, CLASSROOM_ID);

    expect(result.message).toBe("Recording started");
    expect(result.egressId).toBe(EGRESS_ID);
    expect(mockStartRecording).toHaveBeenCalledWith("cls_test-room", {
      bucket: "deenverse-recordings",
      region: "us-east-1",
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      prefix: `classrooms/${CLASSROOM_ID}/`,
    });
    expect(classroom.activeEgressId).toBe(EGRESS_ID);
    expect(classroom.save).toHaveBeenCalled();
  });

  it("rejects when not host (403)", async () => {
    const classroom = makeClassroomDoc();
    Classroom.findById.mockResolvedValue(classroom);

    await expect(startRecording(OTHER_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockStartRecording).not.toHaveBeenCalled();
  });

  it("rejects when classroom is not live (400)", async () => {
    const classroom = makeClassroomDoc({ status: "scheduled" });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(startRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 400,
      message: "Classroom must be live to start recording",
    });
  });

  it("rejects when recording is disabled (400)", async () => {
    const classroom = makeClassroomDoc({
      settings: { recordingEnabled: false },
    });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(startRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 400,
      message: "Recording is not enabled for this classroom",
    });
  });

  it("rejects when recording is already in progress (400)", async () => {
    const classroom = makeClassroomDoc({ activeEgressId: "existing-egress" });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(startRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 400,
      message: "Recording is already in progress",
    });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(startRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─────────────────────────────────────────────────────────
// stopRecording
// ─────────────────────────────────────────────────────────

describe("stopRecording", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID, AWS_REGION: "us-east-1" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host stops recording — stops Egress and pushes recording to array", async () => {
    const classroom = makeClassroomDoc({ activeEgressId: EGRESS_ID });
    Classroom.findById.mockResolvedValue(classroom);
    mockStopRecording.mockResolvedValue({ egressId: EGRESS_ID });

    const result = await stopRecording(HOST_ID, CLASSROOM_ID);

    expect(result.recordingUrl).toBeDefined();
    expect(mockStopRecording).toHaveBeenCalledWith(EGRESS_ID);
    expect(classroom.recordings).toHaveLength(1);
    expect(classroom.recordings[0].egressId).toBe(EGRESS_ID);
    expect(classroom.recordings[0].url).toContain(`classrooms/${CLASSROOM_ID}/`);
    expect(classroom.recordings[0].createdAt).toBeInstanceOf(Date);
    expect(classroom.activeEgressId).toBeNull();
    expect(classroom.save).toHaveBeenCalled();
  });

  it("rejects when not host (403)", async () => {
    const classroom = makeClassroomDoc({ activeEgressId: EGRESS_ID });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(stopRecording(OTHER_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockStopRecording).not.toHaveBeenCalled();
  });

  it("rejects when no active recording (400)", async () => {
    const classroom = makeClassroomDoc({ activeEgressId: null });
    Classroom.findById.mockResolvedValue(classroom);

    await expect(stopRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 400,
      message: "No active recording to stop",
    });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(stopRecording(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─────────────────────────────────────────────────────────
// getRecordings
// ─────────────────────────────────────────────────────────

describe("getRecordings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can access recordings", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "public",
      recordings: [
        { egressId: EGRESS_ID, url: "classrooms/cls001/recording.mp4", createdAt: new Date() },
      ],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await getRecordings(HOST_ID, CLASSROOM_ID);

    expect(result.recordings).toHaveLength(1);
    expect(result.recordings[0].egressId).toBe(EGRESS_ID);
    expect(result.recordings[0].url).toBeDefined();
  });

  it("past participant can access recordings", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "public",
      recordings: [
        { egressId: EGRESS_ID, url: "recording.mp4", createdAt: new Date() },
      ],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue({ _id: "p1" });

    const result = await getRecordings(PARTICIPANT_ID, CLASSROOM_ID);

    expect(result.recordings).toHaveLength(1);
    expect(ClassroomParticipant.exists).toHaveBeenCalledWith({
      classroom: CLASSROOM_ID,
      user: PARTICIPANT_ID,
    });
  });

  it("non-participant gets 403 for public classroom", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "public",
      recordings: [],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);

    await expect(getRecordings(OTHER_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("enrolled student can access course-only recordings", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "course-only",
      course: "course001",
      recordings: [
        { egressId: EGRESS_ID, url: "recording.mp4", createdAt: new Date() },
      ],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "enr1", status: "active" }),
    });

    const result = await getRecordings(PARTICIPANT_ID, CLASSROOM_ID);

    expect(result.recordings).toHaveLength(1);
  });

  it("non-enrolled non-participant gets 403 for course-only", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "course-only",
      course: "course001",
      recordings: [],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(getRecordings(OTHER_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("admin can access any recordings", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      access: "public",
      recordings: [
        { egressId: EGRESS_ID, url: "recording.mp4", createdAt: new Date() },
      ],
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);

    const result = await getRecordings(ADMIN_ID, CLASSROOM_ID);

    expect(result.recordings).toHaveLength(1);
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockReturnValue(chainQuery(null));

    await expect(getRecordings(HOST_ID, CLASSROOM_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
