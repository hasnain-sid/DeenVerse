import {
  createClassroom,
  browseClassrooms,
  getClassroomById,
  startClassroom,
  joinClassroom,
  endClassroom,
  leaveClassroom,
  deleteClassroom,
  updateClassroom,
} from "../services/classroomService.js";
import { Classroom } from "../models/classroomSchema.js";
import { ClassroomParticipant } from "../models/classroomParticipantSchema.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/classroomSchema.js", () => ({
  Classroom: Object.assign(jest.fn(), {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  }),
}));

jest.mock("../models/classroomParticipantSchema.js", () => ({
  ClassroomParticipant: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock("../models/courseSchema.js", () => ({
  Course: {
    findOne: jest.fn(),
  },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn() },
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("../config/aws.js", () => ({
  s3: {},
  S3_BUCKETS: { RECORDINGS: "recordings-bucket" },
}));

jest.mock("@aws-sdk/client-s3", () => ({
  GetObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

// Mock livekitService
const mockCreateRoom = jest.fn();
const mockDeleteRoom = jest.fn();
const mockGenerateToken = jest.fn();

jest.mock("../services/livekitService.js", () => ({
  createRoom: (...args) => mockCreateRoom(...args),
  deleteRoom: (...args) => mockDeleteRoom(...args),
  generateToken: (...args) => mockGenerateToken(...args),
  isLivekitConfigured: jest.fn().mockReturnValue(true),
}));

// Mock socket
jest.mock("../socket/index.js", () => ({
  getIO: jest.fn(() => ({
    emit: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() })),
  })),
  clearHandQueue: jest.fn(),
}));

// ── Helpers ─────────────────────────────────────────────

const HOST_ID = "host123";
const USER_ID = "user456";
const ADMIN_ID = "admin789";
const CLASSROOM_ID = "cls001";
const COURSE_ID = "course001";

const originalEnv = { ...process.env };

function makeClassroomDoc(overrides = {}) {
  const doc = {
    _id: CLASSROOM_ID,
    host: { _id: HOST_ID, toString: () => HOST_ID, name: "Scholar Ali", username: "ali" },
    title: "Tajweed Halaqa",
    description: "Weekly session",
    scheduledAt: new Date(Date.now() + 86400000),
    status: "scheduled",
    type: "halaqa",
    access: "public",
    maxParticipants: 50,
    participantCount: 0,
    peakParticipants: 0,
    participants: [],
    livekitRoomName: "cls_test-room",
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

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv };
  process.env.ADMIN_IDS = ADMIN_ID;
});

// ─────────────────────────────────────────────────────────
// createClassroom
// ─────────────────────────────────────────────────────────

describe("createClassroom", () => {
  it("creates a classroom with valid data and sets host + livekitRoomName", async () => {
    const savedDoc = makeClassroomDoc();

    Classroom.mockImplementation((data) => {
      const inst = { ...data, _id: CLASSROOM_ID };
      inst.save = jest.fn().mockResolvedValue(inst);
      return inst;
    });

    Classroom.findById.mockReturnValue(chainQuery(savedDoc));

    const result = await createClassroom(HOST_ID, {
      title: "Tajweed Halaqa",
      scheduledAt: new Date(Date.now() + 86400000),
    });

    expect(result.classroom).toBeDefined();
    // Verify host was set from userId
    const constructorCall = Classroom.mock.calls[0][0];
    expect(constructorCall.host).toBe(HOST_ID);
    // livekitRoomName should be generated (starts with cls_)
    expect(constructorCall.livekitRoomName).toMatch(/^cls_/);
  });

  it("links course when courseSlug is provided and user is instructor", async () => {
    const courseDoc = {
      _id: COURSE_ID,
      instructor: { toString: () => HOST_ID },
    };
    Course.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(courseDoc) });

    Classroom.mockImplementation((data) => {
      const inst = { ...data, _id: CLASSROOM_ID };
      inst.save = jest.fn().mockResolvedValue(inst);
      return inst;
    });
    Classroom.findById.mockReturnValue(chainQuery(makeClassroomDoc({ course: COURSE_ID })));

    const result = await createClassroom(HOST_ID, {
      title: "Course Session",
      scheduledAt: new Date(Date.now() + 86400000),
      courseSlug: "intro-tajweed",
    });

    expect(result.classroom).toBeDefined();
    const constructorCall = Classroom.mock.calls[0][0];
    expect(constructorCall.course).toBe(COURSE_ID);
    expect(constructorCall.courseSlug).toBeUndefined(); // should be deleted
  });

  it("rejects when courseSlug user is not the course instructor", async () => {
    const courseDoc = {
      _id: COURSE_ID,
      instructor: { toString: () => "other-instructor" },
    };
    Course.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(courseDoc) });

    await expect(
      createClassroom(USER_ID, {
        title: "Course Session",
        scheduledAt: new Date(Date.now() + 86400000),
        courseSlug: "intro-tajweed",
      })
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when courseSlug not found", async () => {
    Course.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    await expect(
      createClassroom(HOST_ID, {
        title: "Course Session",
        scheduledAt: new Date(Date.now() + 86400000),
        courseSlug: "nonexistent",
      })
    ).rejects.toThrow(/Course not found/);
  });
});

// ─────────────────────────────────────────────────────────
// browseClassrooms
// ─────────────────────────────────────────────────────────

describe("browseClassrooms", () => {
  it("returns classrooms with pagination", async () => {
    const classrooms = [makeClassroomDoc()];
    Classroom.find.mockReturnValue(chainQuery(classrooms));
    Classroom.countDocuments.mockResolvedValue(1);

    const result = await browseClassrooms({ page: 1, limit: 12 });

    expect(result.classrooms).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
    });
  });

  it("filters by status", async () => {
    Classroom.find.mockReturnValue(chainQuery([]));
    Classroom.countDocuments.mockResolvedValue(0);

    await browseClassrooms({ status: "live" });

    const query = Classroom.find.mock.calls[0][0];
    expect(query.status).toBe("live");
  });

  it("filters by type", async () => {
    Classroom.find.mockReturnValue(chainQuery([]));
    Classroom.countDocuments.mockResolvedValue(0);

    await browseClassrooms({ type: "halaqa" });

    const query = Classroom.find.mock.calls[0][0];
    expect(query.type).toBe("halaqa");
  });

  it("filters by course slug", async () => {
    Course.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: COURSE_ID }),
      }),
    });
    Classroom.find.mockReturnValue(chainQuery([]));
    Classroom.countDocuments.mockResolvedValue(0);

    await browseClassrooms({ course: "intro-tajweed" });

    const query = Classroom.find.mock.calls[0][0];
    expect(query.course).toBe(COURSE_ID);
  });

  it("returns empty results when course slug not found", async () => {
    Course.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    const result = await browseClassrooms({ course: "nonexistent" });

    expect(result.classrooms).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it("correctly calculates pagination", async () => {
    Classroom.find.mockReturnValue(chainQuery([]));
    Classroom.countDocuments.mockResolvedValue(25);

    const result = await browseClassrooms({ page: 2, limit: 10 });

    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
    // Verify skip was called with correct offset
    const chain = Classroom.find.mock.results[0].value;
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });
});

// ─────────────────────────────────────────────────────────
// startClassroom
// ─────────────────────────────────────────────────────────

describe("startClassroom", () => {
  it("only host can start — creates LiveKit room and returns token", async () => {
    const doc = makeClassroomDoc({ host: { toString: () => HOST_ID } });
    Classroom.findById
      .mockResolvedValueOnce(doc) // first call — mutable doc
      .mockReturnValueOnce(chainQuery(makeClassroomDoc({ status: "live" }))); // second call — populated

    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: "Scholar Ali", username: "ali" }),
      }),
    });

    mockCreateRoom.mockResolvedValue({ name: "cls_test-room", sid: "sid-123" });
    mockGenerateToken.mockResolvedValue("host-jwt-token");
    ClassroomParticipant.findOneAndUpdate.mockResolvedValue({});

    const result = await startClassroom(HOST_ID, CLASSROOM_ID);

    expect(result.livekitToken).toBe("host-jwt-token");
    expect(result.classroom).toBeDefined();
    expect(mockCreateRoom).toHaveBeenCalledWith("cls_test-room", 50);
    expect(mockGenerateToken).toHaveBeenCalledWith(
      HOST_ID,
      "Scholar Ali",
      "cls_test-room",
      expect.objectContaining({ isHost: true })
    );
    expect(doc.status).toBe("live");
    expect(doc.save).toHaveBeenCalled();
  });

  it("rejects when non-host tries to start", async () => {
    const doc = makeClassroomDoc({ host: { toString: () => HOST_ID } });
    Classroom.findById.mockResolvedValue(doc);

    await expect(startClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Only the host can start/
    );
  });

  it("rejects when classroom is already live", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(startClassroom(HOST_ID, CLASSROOM_ID)).rejects.toThrow(
      /already live/
    );
  });

  it("rejects when classroom has ended", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "ended",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(startClassroom(HOST_ID, CLASSROOM_ID)).rejects.toThrow(
      /already ended/
    );
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(startClassroom(HOST_ID, "nonexistent")).rejects.toThrow(
      /Classroom not found/
    );
  });
});

// ─────────────────────────────────────────────────────────
// joinClassroom
// ─────────────────────────────────────────────────────────

describe("joinClassroom", () => {
  it("allows any authenticated user for access=public", async () => {
    const doc = makeClassroomDoc({
      status: "live",
      access: "public",
      host: { _id: HOST_ID, toString: () => HOST_ID, followers: [] },
    });
    Classroom.findById.mockReturnValueOnce(
      chainQuery(doc)
    );

    ClassroomParticipant.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: "Ahmed", username: "ahmed" }),
      }),
    });
    mockGenerateToken.mockResolvedValue("participant-jwt");
    ClassroomParticipant.create.mockResolvedValue({});
    Classroom.findByIdAndUpdate.mockResolvedValue({
      participantCount: 1,
      peakParticipants: 0,
    });
    Classroom.updateOne.mockResolvedValue({});
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    const result = await joinClassroom(USER_ID, CLASSROOM_ID);

    expect(result.livekitToken).toBe("participant-jwt");
  });

  it("verifies enrollment for access=course-only", async () => {
    const doc = makeClassroomDoc({
      status: "live",
      access: "course-only",
      course: COURSE_ID,
      host: { _id: HOST_ID, toString: () => HOST_ID },
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    // Not enrolled
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(joinClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /must be enrolled/
    );
  });

  it("allows enrolled student for access=course-only", async () => {
    const doc = makeClassroomDoc({
      status: "live",
      access: "course-only",
      course: COURSE_ID,
      host: { _id: HOST_ID, toString: () => HOST_ID },
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    // Enrolled
    Enrollment.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "enr1", status: "active" }),
    });
    ClassroomParticipant.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: "Student", username: "student" }),
      }),
    });
    mockGenerateToken.mockResolvedValue("enrolled-jwt");
    ClassroomParticipant.create.mockResolvedValue({});
    Classroom.findByIdAndUpdate.mockResolvedValue({
      participantCount: 1,
      peakParticipants: 0,
    });
    Classroom.updateOne.mockResolvedValue({});
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    const result = await joinClassroom(USER_ID, CLASSROOM_ID);

    expect(result.livekitToken).toBe("enrolled-jwt");
  });

  it("rejects when classroom is full", async () => {
    const doc = makeClassroomDoc({
      status: "live",
      access: "public",
      maxParticipants: 2,
      participants: [HOST_ID, "user2"],
      host: { _id: HOST_ID, toString: () => HOST_ID, followers: [] },
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    await expect(joinClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Classroom is full/
    );
  });

  it("handles reconnection — generates new token without creating duplicate participant", async () => {
    const doc = makeClassroomDoc({
      status: "live",
      access: "public",
      participants: [USER_ID],
      participantCount: 1,
      host: { _id: HOST_ID, toString: () => HOST_ID, followers: [] },
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    // Existing participant found (reconnection)
    ClassroomParticipant.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "part1", user: USER_ID }),
    });
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ name: "Ahmed", username: "ahmed" }),
      }),
    });
    mockGenerateToken.mockResolvedValue("reconnect-jwt");
    ClassroomParticipant.updateOne.mockResolvedValue({});
    Classroom.findByIdAndUpdate.mockResolvedValue({
      participantCount: 1,
      peakParticipants: 1,
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    const result = await joinClassroom(USER_ID, CLASSROOM_ID);

    expect(result.livekitToken).toBe("reconnect-jwt");
    // Should NOT call create (reconnection updates existing)
    expect(ClassroomParticipant.create).not.toHaveBeenCalled();
    // Should increment by 0 for reconnection
    expect(Classroom.findByIdAndUpdate).toHaveBeenCalledWith(
      CLASSROOM_ID,
      expect.objectContaining({
        $inc: { participantCount: 0 },
      }),
      { new: true }
    );
  });

  it("rejects when classroom is not live", async () => {
    const doc = makeClassroomDoc({
      status: "scheduled",
      access: "public",
      host: { _id: HOST_ID, toString: () => HOST_ID },
    });
    Classroom.findById.mockReturnValueOnce(chainQuery(doc));

    await expect(joinClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /not currently live/
    );
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockReturnValueOnce(chainQuery(null));

    await expect(joinClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Classroom not found/
    );
  });
});

// ─────────────────────────────────────────────────────────
// endClassroom
// ─────────────────────────────────────────────────────────

describe("endClassroom", () => {
  it("host can end — deletes LiveKit room and sets ended status", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById
      .mockResolvedValueOnce(doc)
      .mockReturnValueOnce(chainQuery(makeClassroomDoc({ status: "ended" })));

    ClassroomParticipant.find.mockResolvedValue([]);
    mockDeleteRoom.mockResolvedValue(undefined);

    const result = await endClassroom(HOST_ID, CLASSROOM_ID);

    expect(mockDeleteRoom).toHaveBeenCalledWith("cls_test-room");
    expect(doc.status).toBe("ended");
    expect(doc.endedAt).toBeDefined();
    expect(doc.participantCount).toBe(0);
    expect(doc.save).toHaveBeenCalled();
    expect(result.classroom).toBeDefined();
  });

  it("admin can end", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById
      .mockResolvedValueOnce(doc)
      .mockReturnValueOnce(chainQuery(makeClassroomDoc({ status: "ended" })));

    ClassroomParticipant.find.mockResolvedValue([]);
    mockDeleteRoom.mockResolvedValue(undefined);

    const result = await endClassroom(ADMIN_ID, CLASSROOM_ID);

    expect(result.classroom).toBeDefined();
    expect(doc.status).toBe("ended");
  });

  it("rejects when non-host/non-admin tries to end", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(endClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Only the host or an admin/
    );
  });

  it("rejects when classroom is not live", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(endClassroom(HOST_ID, CLASSROOM_ID)).rejects.toThrow(
      /not live/
    );
  });

  it("updates leftAt for all active participants", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById
      .mockResolvedValueOnce(doc)
      .mockReturnValueOnce(chainQuery(makeClassroomDoc({ status: "ended" })));

    const mockParticipant = {
      joinedAt: new Date(Date.now() - 60000), // joined 1 min ago
      leftAt: null,
      duration: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    ClassroomParticipant.find.mockResolvedValue([mockParticipant]);
    mockDeleteRoom.mockResolvedValue(undefined);

    await endClassroom(HOST_ID, CLASSROOM_ID);

    expect(mockParticipant.leftAt).toBeDefined();
    expect(mockParticipant.save).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────
// leaveClassroom
// ─────────────────────────────────────────────────────────

describe("leaveClassroom", () => {
  it("decrements participantCount and sets leftAt", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
      participantCount: 5,
    });
    Classroom.findById.mockResolvedValue(doc);
    Classroom.updateOne.mockResolvedValue({});

    const mockParticipant = {
      joinedAt: new Date(Date.now() - 120000),
      leftAt: null,
      duration: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    ClassroomParticipant.findOne.mockResolvedValue(mockParticipant);

    const result = await leaveClassroom(USER_ID, CLASSROOM_ID);

    expect(result.message).toBe("Left classroom");
    expect(mockParticipant.leftAt).toBeDefined();
    expect(mockParticipant.save).toHaveBeenCalled();
    expect(Classroom.updateOne).toHaveBeenCalledWith(
      { _id: CLASSROOM_ID, participantCount: { $gt: 0 } },
      expect.objectContaining({
        $pull: { participants: USER_ID },
        $inc: { participantCount: -1 },
      })
    );
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(leaveClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Classroom not found/
    );
  });
});

// ─────────────────────────────────────────────────────────
// deleteClassroom
// ─────────────────────────────────────────────────────────

describe("deleteClassroom", () => {
  it("prevents deletion of a live classroom", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(deleteClassroom(HOST_ID, CLASSROOM_ID)).rejects.toThrow(
      /Cannot delete a live classroom/
    );
  });

  it("hard-deletes a scheduled classroom", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById.mockResolvedValue(doc);
    Classroom.deleteOne.mockResolvedValue({});

    const result = await deleteClassroom(HOST_ID, CLASSROOM_ID);

    expect(result.message).toBe("Classroom deleted");
    expect(Classroom.deleteOne).toHaveBeenCalledWith({ _id: CLASSROOM_ID });
  });

  it("soft-deletes an ended classroom", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "ended",
    });
    Classroom.findById.mockResolvedValue(doc);

    const result = await deleteClassroom(HOST_ID, CLASSROOM_ID);

    expect(result.message).toBe("Classroom archived");
    expect(doc.deletedAt).toBeDefined();
    expect(doc.save).toHaveBeenCalled();
  });

  it("rejects when non-host tries to delete", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(deleteClassroom(USER_ID, CLASSROOM_ID)).rejects.toThrow(
      /Only the host can delete/
    );
  });

  it("admin can delete", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById.mockResolvedValue(doc);
    Classroom.deleteOne.mockResolvedValue({});

    const result = await deleteClassroom(ADMIN_ID, CLASSROOM_ID);

    expect(result.message).toBe("Classroom deleted");
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(deleteClassroom(HOST_ID, "nonexistent")).rejects.toThrow(
      /Classroom not found/
    );
  });
});

// ─────────────────────────────────────────────────────────
// updateClassroom
// ─────────────────────────────────────────────────────────

describe("updateClassroom", () => {
  it("host can update allowed fields", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById
      .mockResolvedValueOnce(doc)
      .mockReturnValueOnce(chainQuery(makeClassroomDoc({ title: "Updated Title" })));

    const result = await updateClassroom(HOST_ID, CLASSROOM_ID, {
      title: "Updated Title",
    });

    expect(doc.title).toBe("Updated Title");
    expect(doc.save).toHaveBeenCalled();
    expect(result.classroom).toBeDefined();
  });

  it("rejects when non-host tries to update (403)", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "scheduled",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(
      updateClassroom(USER_ID, CLASSROOM_ID, { title: "Hacked" })
    ).rejects.toThrow(/Only the host can update/);
  });

  it("admin can update", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
    });
    Classroom.findById
      .mockResolvedValueOnce(doc)
      .mockReturnValueOnce(chainQuery(makeClassroomDoc()));

    const result = await updateClassroom(ADMIN_ID, CLASSROOM_ID, {
      title: "Admin Updated",
    });

    expect(result.classroom).toBeDefined();
  });

  it("rejects changing scheduledAt on a live classroom", async () => {
    const doc = makeClassroomDoc({
      host: { toString: () => HOST_ID },
      status: "live",
    });
    Classroom.findById.mockResolvedValue(doc);

    await expect(
      updateClassroom(HOST_ID, CLASSROOM_ID, { scheduledAt: new Date() })
    ).rejects.toThrow(/Cannot change scheduledAt or type while classroom is live/);
  });

  it("throws 404 when classroom not found", async () => {
    Classroom.findById.mockResolvedValue(null);

    await expect(
      updateClassroom(HOST_ID, "nonexistent", { title: "X" })
    ).rejects.toThrow(/Classroom not found/);
  });
});
