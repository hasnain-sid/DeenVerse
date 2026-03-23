/**
 * Phase 3 Smoke / Integration Tests
 *
 * Tests all Phase-3 API endpoints (Classroom CRUD, Lifecycle, Controls,
 * Recording, Whiteboard, Discovery) against a lightweight Express app
 * backed by mongodb-memory-server.
 *
 * LiveKit, Redis, Socket.IO, S3, and notification calls are fully mocked.
 * 29 tests covering the requirements from TASK-085.
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import request from "supertest";

// ── Environment variables (before any app code is imported) ──────────
process.env.TOKEN_SECRET = "test-access-secret-phase3";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-phase3";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL_PROD = "http://localhost:3000";

// ── Mock Redis ───────────────────────────────────────────────────────
jest.mock("../../config/redis.js", () => ({
  getRedisClient: jest.fn(() => null),
  isRedisConnected: jest.fn(() => false),
}));

// ── Suppress logger output ───────────────────────────────────────────
jest.mock("../../config/logger.js", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ── Mock notification service ────────────────────────────────────────
jest.mock("../../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock LiveKit service (return placeholder tokens/rooms) ───────────
jest.mock("../../services/livekitService.js", () => ({
  isLivekitConfigured: jest.fn(() => true),
  createRoom: jest.fn(async (roomName) => ({
    name: roomName,
    sid: `test-sid-${roomName}`,
  })),
  deleteRoom: jest.fn(async () => {}),
  generateToken: jest.fn(async (userId, userName, roomName) =>
    `mock-token-${userId}-${roomName}`
  ),
  listParticipants: jest.fn(async () => []),
  muteParticipant: jest.fn(async () => {}),
  removeParticipant: jest.fn(async () => {}),
  startRecording: jest.fn(async (roomName) => ({
    egressId: `egress-${roomName}`,
  })),
  stopRecording: jest.fn(async () => {}),
}));

// ── Mock AWS S3 (presigned URLs) ─────────────────────────────────────
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(async () => "https://s3.example.com/signed-recording.mp4"),
}));

// ── Mock Socket.IO imports in service (dynamic imports silently fail) ─
jest.mock("../../socket/index.js", () => ({
  getIO: jest.fn(() => ({
    emit: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() })),
  })),
  clearHandQueue: jest.fn(),
}));

// ── Import models and routes AFTER mocks ─────────────────────────────
import { User } from "../../models/userSchema.js";
import { Classroom } from "../../models/classroomSchema.js";
import { ClassroomParticipant } from "../../models/classroomParticipantSchema.js";
import { Course } from "../../models/courseSchema.js";
import { Enrollment } from "../../models/enrollmentSchema.js";
import classroomRoute from "../../routes/classroomRoute.js";
import errorHandler from "../../middlewares/errorHandler.js";

// ── Test App ─────────────────────────────────────────────────────────
function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api/v1/classrooms", classroomRoute);
  app.use(errorHandler);
  return app;
}

// ── Token helpers ────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

function authHeader(userId) {
  return { Authorization: `Bearer ${signToken(userId)}` };
}

// ── Test fixtures ────────────────────────────────────────────────────
const validClassroomBody = (overrides = {}) => ({
  title: "Introduction to Tafseer",
  description: "A live session covering the basics of Quranic exegesis.",
  type: "lecture",
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
  duration: 60,
  maxParticipants: 50,
  access: "public",
  settings: {
    chatEnabled: true,
    handRaiseEnabled: true,
    recordingEnabled: true,
    whiteboardEnabled: true,
  },
  ...overrides,
});

// ── Global state ─────────────────────────────────────────────────────
let mongoServer;
let app;
let scholar;
let scholar2;
let student;
let student2;
let classroomId;        // main classroom created in test 3
let courseOnlyClassId;   // course-only access classroom for enrollment tests

// ── Lifecycle ────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongoServer.getUri());
  app = createApp();

  // Create test users
  [scholar, scholar2, student, student2] = await Promise.all([
    User.create({
      name: "Scholar Host",
      username: "scholar_host",
      email: "scholar_host@smoke.test",
      password: "hashed_pw",
      role: "scholar",
    }),
    User.create({
      name: "Scholar Other",
      username: "scholar_other",
      email: "scholar_other@smoke.test",
      password: "hashed_pw",
      role: "scholar",
    }),
    User.create({
      name: "Student One",
      username: "student_one",
      email: "student_one@smoke.test",
      password: "hashed_pw",
      role: "user",
    }),
    User.create({
      name: "Student Two",
      username: "student_two",
      email: "student_two@smoke.test",
      password: "hashed_pw",
      role: "user",
    }),
  ]);

  // Create a course + enrollment for course-only access tests
  const course = await Course.create({
    title: "Fiqh Fundamentals",
    slug: "fiqh-fundamentals",
    description: "Course for classroom enrollment tests",
    instructor: scholar._id,
    category: "fiqh",
    level: "beginner",
    type: "self-paced",
    pricing: { type: "free" },
    status: "published",
    modules: [],
  });

  // Enroll student (but not student2 — for access denial tests)
  await Enrollment.create({
    student: student._id,
    course: course._id,
    status: "active",
  });

  // Create a course-only classroom (scheduled, for join access tests later)
  const courseOnly = await Classroom.create({
    host: scholar._id,
    title: "Fiqh Live Q&A",
    description: "Course-only classroom",
    course: course._id,
    type: "qa-session",
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    duration: 45,
    maxParticipants: 5,
    access: "course-only",
    livekitRoomName: `cls_course_only_test`,
    settings: { chatEnabled: true, recordingEnabled: false, whiteboardEnabled: false },
  });
  courseOnlyClassId = courseOnly._id.toString();
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30_000);

afterEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────
// CLASSROOM CRUD (tests 1–9)
// ─────────────────────────────────────────────────────────────────────

describe("Classroom CRUD", () => {
  it("1. Unauthenticated POST /api/v1/classrooms → 401", async () => {
    const res = await request(app)
      .post("/api/v1/classrooms")
      .send(validClassroomBody());
    expect(res.status).toBe(401);
  });

  it("2. Authenticated non-scholar POST /api/v1/classrooms → 403", async () => {
    const res = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(student._id))
      .send(validClassroomBody());
    expect(res.status).toBe(403);
  });

  it("3. Scholar POST /api/v1/classrooms with valid body → 201", async () => {
    const res = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(validClassroomBody());
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.classroom).toBeDefined();
    expect(res.body.classroom.livekitRoomName).toBeDefined();
    expect(res.body.classroom.title).toBe("Introduction to Tafseer");
    expect(res.body.classroom.host).toBeDefined();
    classroomId = res.body.classroom._id;
  });

  it("4. GET /api/v1/classrooms → 200, returns paginated classrooms", async () => {
    const res = await request(app).get("/api/v1/classrooms");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.classrooms)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it("5. GET /api/v1/classrooms?status=scheduled → 200, only scheduled", async () => {
    const res = await request(app).get("/api/v1/classrooms?status=scheduled");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const c of res.body.classrooms) {
      expect(c.status).toBe("scheduled");
    }
  });

  it("6. GET /api/v1/classrooms/:id → 200, includes host info", async () => {
    const res = await request(app)
      .get(`/api/v1/classrooms/${classroomId}`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.classroom.host).toBeDefined();
    expect(res.body.classroom.host.name).toBe("Scholar Host");
  });

  it("7. Scholar PUT /api/v1/classrooms/:id → 200, update succeeds for host", async () => {
    const res = await request(app)
      .put(`/api/v1/classrooms/${classroomId}`)
      .set(authHeader(scholar._id))
      .send({ title: "Updated Tafseer Session", duration: 90 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.classroom.title).toBe("Updated Tafseer Session");
    expect(res.body.classroom.duration).toBe(90);
  });

  it("8. Different scholar PUT /api/v1/classrooms/:id → 403 (not host)", async () => {
    const res = await request(app)
      .put(`/api/v1/classrooms/${classroomId}`)
      .set(authHeader(scholar2._id))
      .send({ title: "Hijacked Title" });
    expect(res.status).toBe(403);
  });

  it("9. Scholar DELETE /api/v1/classrooms/:id (scheduled) → 200, hard delete", async () => {
    // Create a throwaway classroom to delete
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(validClassroomBody({ title: "Deletable Session" }));
    const deleteId = createRes.body.classroom._id;

    const res = await request(app)
      .delete(`/api/v1/classrooms/${deleteId}`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify hard deletion
    const gone = await Classroom.findById(deleteId);
    expect(gone).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// LIFECYCLE (tests 10–18)
// ─────────────────────────────────────────────────────────────────────

describe("Lifecycle", () => {
  it("10. Scholar POST /api/v1/classrooms/:id/start → 200, returns livekitToken", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${classroomId}/start`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.livekitToken).toBeDefined();
    expect(res.body.livekitToken).toContain("mock-token-");
    expect(res.body.classroom.status).toBe("live");
  });

  it("11. Non-host POST /api/v1/classrooms/:id/start → 403", async () => {
    // Create a fresh scheduled classroom for this test
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(validClassroomBody({ title: "Non-host Start Test" }));
    const freshId = createRes.body.classroom._id;

    const res = await request(app)
      .post(`/api/v1/classrooms/${freshId}/start`)
      .set(authHeader(scholar2._id));
    expect(res.status).toBe(403);
  });

  it("12. POST /api/v1/classrooms/:id/start (already live) → 400", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${classroomId}/start`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(400);
  });

  it("13. Enrolled student POST /api/v1/classrooms/:id/join (course-only) → 200", async () => {
    // Start the course-only classroom first so it's live
    await Classroom.updateOne(
      { _id: courseOnlyClassId },
      { status: "live", startedAt: new Date(), participants: [scholar._id], participantCount: 1 }
    );

    const res = await request(app)
      .post(`/api/v1/classrooms/${courseOnlyClassId}/join`)
      .set(authHeader(student._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.livekitToken).toBeDefined();
  });

  it("14. Non-enrolled student POST /api/v1/classrooms/:id/join (course-only) → 403", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${courseOnlyClassId}/join`)
      .set(authHeader(student2._id));
    expect(res.status).toBe(403);
  });

  it("15. POST /api/v1/classrooms/:id/join (public access) → 200 for any authenticated user", async () => {
    // classroomId has access: "public" and is live from test 10
    const res = await request(app)
      .post(`/api/v1/classrooms/${classroomId}/join`)
      .set(authHeader(student2._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.livekitToken).toBeDefined();
  });

  it("16. POST /api/v1/classrooms/:id/join (full classroom) → 403", async () => {
    // Set maxParticipants to current count to simulate full
    const classroom = await Classroom.findById(classroomId);
    const currentCount = classroom.participants.length;
    await Classroom.updateOne(
      { _id: classroomId },
      { maxParticipants: currentCount }
    );

    // Create a new student who hasn't joined yet
    const newStudent = await User.create({
      name: "New Student",
      username: "new_student_full",
      email: "new_student_full@smoke.test",
      password: "hashed_pw",
      role: "user",
    });

    const res = await request(app)
      .post(`/api/v1/classrooms/${classroomId}/join`)
      .set(authHeader(newStudent._id));
    expect(res.status).toBe(403);

    // Restore maxParticipants
    await Classroom.updateOne({ _id: classroomId }, { maxParticipants: 50 });
  });

  it("17. Scholar POST /api/v1/classrooms/:id/end → 200, status becomes ended", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${classroomId}/end`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.classroom.status).toBe("ended");
  });

  it("18. Student POST /api/v1/classrooms/:id/leave → 200, participantCount decremented", async () => {
    // We need a live classroom for leave. Start a new one.
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(validClassroomBody({ title: "Leave Test Classroom" }));
    const leaveClassId = createRes.body.classroom._id;

    // Start it
    await request(app)
      .post(`/api/v1/classrooms/${leaveClassId}/start`)
      .set(authHeader(scholar._id));

    // Student joins
    await request(app)
      .post(`/api/v1/classrooms/${leaveClassId}/join`)
      .set(authHeader(student._id));

    const beforeLeave = await Classroom.findById(leaveClassId).lean();
    const countBefore = beforeLeave.participantCount;

    // Student leaves
    const res = await request(app)
      .post(`/api/v1/classrooms/${leaveClassId}/leave`)
      .set(authHeader(student._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const afterLeave = await Classroom.findById(leaveClassId).lean();
    expect(afterLeave.participantCount).toBe(countBefore - 1);

    // Cleanup: end the classroom
    await request(app)
      .post(`/api/v1/classrooms/${leaveClassId}/end`)
      .set(authHeader(scholar._id));
  });
});

// ─────────────────────────────────────────────────────────────────────
// CONTROLS (tests 19–22)
// ─────────────────────────────────────────────────────────────────────

describe("Controls", () => {
  let controlClassId;

  beforeAll(async () => {
    // Create and start a live classroom for control tests
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(validClassroomBody({ title: "Controls Test Classroom" }));
    controlClassId = createRes.body.classroom._id;

    await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/start`)
      .set(authHeader(scholar._id));

    // Student joins
    await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/join`)
      .set(authHeader(student._id));
  });

  afterAll(async () => {
    // End the classroom
    await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/end`)
      .set(authHeader(scholar._id));
  });

  it("19. Host POST /api/v1/classrooms/:id/mute/:participantId → 200", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/mute/${student._id}`)
      .set(authHeader(scholar._id))
      .send({ audio: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("20. Non-host POST /api/v1/classrooms/:id/mute/:participantId → 403", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/mute/${student._id}`)
      .set(authHeader(student._id))
      .send({ audio: true });
    expect(res.status).toBe(403);
  });

  it("21. Host POST /api/v1/classrooms/:id/kick/:participantId → 200", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${controlClassId}/kick/${student._id}`)
      .set(authHeader(scholar._id))
      .send({ reason: "Disruptive" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("22. Host PUT /api/v1/classrooms/:id/settings → 200, settings updated", async () => {
    const res = await request(app)
      .put(`/api/v1/classrooms/${controlClassId}/settings`)
      .set(authHeader(scholar._id))
      .send({ chatEnabled: false, handRaiseEnabled: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.classroom.settings.chatEnabled).toBe(false);
    expect(res.body.classroom.settings.handRaiseEnabled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// RECORDING (tests 23–25)
// ─────────────────────────────────────────────────────────────────────

describe("Recording", () => {
  let recClassId;

  beforeAll(async () => {
    // Create and start a live classroom with recording enabled
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(
        validClassroomBody({
          title: "Recording Test Classroom",
          settings: {
            chatEnabled: true,
            recordingEnabled: true,
            whiteboardEnabled: true,
          },
        })
      );
    recClassId = createRes.body.classroom._id;

    await request(app)
      .post(`/api/v1/classrooms/${recClassId}/start`)
      .set(authHeader(scholar._id));

    // Student joins (needed for getRecordings access)
    await request(app)
      .post(`/api/v1/classrooms/${recClassId}/join`)
      .set(authHeader(student._id));
  });

  afterAll(async () => {
    await request(app)
      .post(`/api/v1/classrooms/${recClassId}/end`)
      .set(authHeader(scholar._id));
  });

  it("23. Host POST /api/v1/classrooms/:id/recording/start (recording enabled) → 200", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${recClassId}/recording/start`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.egressId).toBeDefined();
  });

  it("24. Host POST /api/v1/classrooms/:id/recording/stop → 200", async () => {
    const res = await request(app)
      .post(`/api/v1/classrooms/${recClassId}/recording/stop`)
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("25. GET /api/v1/classrooms/:id/recordings (participant) → 200", async () => {
    const res = await request(app)
      .get(`/api/v1/classrooms/${recClassId}/recordings`)
      .set(authHeader(student._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.recordings)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// WHITEBOARD (tests 26–27)
// ─────────────────────────────────────────────────────────────────────

describe("Whiteboard", () => {
  let wbClassId;

  beforeAll(async () => {
    // Create and start a live classroom with whiteboard enabled
    const createRes = await request(app)
      .post("/api/v1/classrooms")
      .set(authHeader(scholar._id))
      .send(
        validClassroomBody({
          title: "Whiteboard Test Classroom",
          settings: {
            chatEnabled: true,
            whiteboardEnabled: true,
            recordingEnabled: false,
          },
        })
      );
    wbClassId = createRes.body.classroom._id;

    await request(app)
      .post(`/api/v1/classrooms/${wbClassId}/start`)
      .set(authHeader(scholar._id));

    // Student joins as participant
    await request(app)
      .post(`/api/v1/classrooms/${wbClassId}/join`)
      .set(authHeader(student._id));
  });

  afterAll(async () => {
    await request(app)
      .post(`/api/v1/classrooms/${wbClassId}/end`)
      .set(authHeader(scholar._id));
  });

  it("26. Host PUT /api/v1/classrooms/:id/whiteboard → 200", async () => {
    const snapshot = { shapes: [{ id: "s1", type: "rect", x: 10, y: 20 }] };
    const res = await request(app)
      .put(`/api/v1/classrooms/${wbClassId}/whiteboard`)
      .set(authHeader(scholar._id))
      .send({ snapshot });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("27. Participant GET /api/v1/classrooms/:id/whiteboard → 200", async () => {
    const res = await request(app)
      .get(`/api/v1/classrooms/${wbClassId}/whiteboard`)
      .set(authHeader(student._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.snapshot).toBeDefined();
    expect(res.body.snapshot.shapes).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// DISCOVERY (tests 28–29)
// ─────────────────────────────────────────────────────────────────────

describe("Discovery", () => {
  it("28. GET /api/v1/classrooms/upcoming → 200, only future sessions", async () => {
    const res = await request(app).get("/api/v1/classrooms/upcoming");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.classrooms)).toBe(true);
    // All returned classrooms should have future scheduledAt
    for (const c of res.body.classrooms) {
      expect(new Date(c.scheduledAt).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("29. GET /api/v1/classrooms/my-sessions → 200", async () => {
    const res = await request(app)
      .get("/api/v1/classrooms/my-sessions")
      .set(authHeader(scholar._id));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.classrooms)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    // Scholar has hosted multiple classrooms
    expect(res.body.classrooms.length).toBeGreaterThanOrEqual(1);
  });
});
