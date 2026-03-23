import {
  saveWhiteboardSnapshot,
  getWhiteboardSnapshot,
  clearWhiteboardSnapshot,
} from "../services/classroomService.js";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/classroomSchema.js", () => ({
  Classroom: Object.assign(jest.fn(), {
    findById: jest.fn(),
    updateOne: jest.fn().mockResolvedValue({}),
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

jest.mock("../services/livekitService.js", () => ({}));

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

// Sample tldraw whiteboard snapshot (arbitrary JSON)
const SAMPLE_SNAPSHOT = {
  version: 1,
  shapes: [
    { id: "shape1", type: "rectangle", x: 10, y: 20, width: 100, height: 50 },
    { id: "shape2", type: "text", x: 50, y: 80, text: "Bismillah" },
  ],
  bindings: [],
  assets: {},
};

// ─────────────────────────────────────────────────────────
// saveWhiteboardSnapshot
// ─────────────────────────────────────────────────────────

describe("saveWhiteboardSnapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can save whiteboard snapshot", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await saveWhiteboardSnapshot(HOST_ID, CLASSROOM_ID, SAMPLE_SNAPSHOT);

    expect(result.message).toBe("Whiteboard snapshot saved");
    expect(Classroom.updateOne).toHaveBeenCalledWith(
      { _id: CLASSROOM_ID },
      { $set: { whiteboardSnapshot: SAMPLE_SNAPSHOT } }
    );
  });

  it("admin can save whiteboard snapshot", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await saveWhiteboardSnapshot(ADMIN_ID, CLASSROOM_ID, SAMPLE_SNAPSHOT);

    expect(result.message).toBe("Whiteboard snapshot saved");
  });

  it("non-host non-admin gets 403", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    await expect(
      saveWhiteboardSnapshot(OTHER_ID, CLASSROOM_ID, SAMPLE_SNAPSHOT)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects when classroom is not live (400)", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "ended",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    await expect(
      saveWhiteboardSnapshot(HOST_ID, CLASSROOM_ID, SAMPLE_SNAPSHOT)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockReturnValue(chainQuery(null));

    await expect(
      saveWhiteboardSnapshot(HOST_ID, CLASSROOM_ID, SAMPLE_SNAPSHOT)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("stores snapshot as Mixed type — accepts any JSON structure", async () => {
    const complexSnapshot = {
      nested: { deep: { data: [1, 2, { key: "value" }] } },
      array: [null, true, "string", 42],
    };
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    await saveWhiteboardSnapshot(HOST_ID, CLASSROOM_ID, complexSnapshot);

    expect(Classroom.updateOne).toHaveBeenCalledWith(
      { _id: CLASSROOM_ID },
      { $set: { whiteboardSnapshot: complexSnapshot } }
    );
  });
});

// ─────────────────────────────────────────────────────────
// getWhiteboardSnapshot
// ─────────────────────────────────────────────────────────

describe("getWhiteboardSnapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can get whiteboard snapshot", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "public",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await getWhiteboardSnapshot(HOST_ID, CLASSROOM_ID);

    expect(result.snapshot).toEqual(SAMPLE_SNAPSHOT);
  });

  it("participant can get whiteboard snapshot", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "public",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue({ _id: "p1" });

    const result = await getWhiteboardSnapshot(PARTICIPANT_ID, CLASSROOM_ID);

    expect(result.snapshot).toEqual(SAMPLE_SNAPSHOT);
    expect(ClassroomParticipant.exists).toHaveBeenCalledWith({
      classroom: CLASSROOM_ID,
      user: PARTICIPANT_ID,
    });
  });

  it("non-participant gets 403 for public classroom", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "public",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);

    await expect(
      getWhiteboardSnapshot(OTHER_ID, CLASSROOM_ID)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("enrolled student can access course-only whiteboard", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "course-only",
      course: "course001",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "enr1", status: "active" }),
    });

    const result = await getWhiteboardSnapshot(PARTICIPANT_ID, CLASSROOM_ID);

    expect(result.snapshot).toEqual(SAMPLE_SNAPSHOT);
  });

  it("non-enrolled non-participant gets 403 for course-only", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "course-only",
      course: "course001",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));
    ClassroomParticipant.exists.mockResolvedValue(null);
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      getWhiteboardSnapshot(OTHER_ID, CLASSROOM_ID)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("returns null when no snapshot exists", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "public",
      whiteboardSnapshot: undefined,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await getWhiteboardSnapshot(HOST_ID, CLASSROOM_ID);

    expect(result.snapshot).toBeNull();
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockReturnValue(chainQuery(null));

    await expect(
      getWhiteboardSnapshot(HOST_ID, CLASSROOM_ID)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("admin can access any whiteboard", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
      access: "public",
      whiteboardSnapshot: SAMPLE_SNAPSHOT,
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await getWhiteboardSnapshot(ADMIN_ID, CLASSROOM_ID);

    expect(result.snapshot).toEqual(SAMPLE_SNAPSHOT);
  });
});

// ─────────────────────────────────────────────────────────
// clearWhiteboardSnapshot
// ─────────────────────────────────────────────────────────

describe("clearWhiteboardSnapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_IDS: ADMIN_ID };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("host can clear whiteboard snapshot", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    const result = await clearWhiteboardSnapshot(HOST_ID, CLASSROOM_ID);

    expect(result.message).toBe("Whiteboard cleared");
    expect(Classroom.updateOne).toHaveBeenCalledWith(
      { _id: CLASSROOM_ID },
      { $unset: { whiteboardSnapshot: 1 } }
    );
  });

  it("non-host non-admin gets 403", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "live",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    await expect(
      clearWhiteboardSnapshot(OTHER_ID, CLASSROOM_ID)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects when classroom is not live (400)", async () => {
    const classroomDoc = {
      _id: CLASSROOM_ID,
      host: { _id: { toString: () => HOST_ID } },
      status: "scheduled",
    };
    Classroom.findById.mockReturnValue(chainQuery(classroomDoc));

    await expect(
      clearWhiteboardSnapshot(HOST_ID, CLASSROOM_ID)
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
