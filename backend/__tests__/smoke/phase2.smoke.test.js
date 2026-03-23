/**
 * Phase 2 Smoke / Integration Tests
 *
 * Tests all Phase-2 API endpoints (Course CRUD, Enrollment, Quiz, Admin Review,
 * Discovery) against a lightweight Express app backed by mongodb-memory-server.
 *
 * Stripe, Redis, and notification calls are fully mocked.
 * 25 tests covering the requirements from TASK-064.
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import request from "supertest";

// ── Environment variables (before any app code is imported) ──────────
process.env.TOKEN_SECRET = "test-access-secret-phase2";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-phase2";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL_PROD = "http://localhost:3000";
process.env.COURSE_COMMISSION_RATE = "0.30";

// ── Mock Redis (not needed for smoke tests) ──────────────────────────
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

// ── Mock notification service (non-critical side-effect) ─────────────
jest.mock("../../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock Stripe ──────────────────────────────────────────────────────
jest.mock("stripe", () =>
  jest.fn(() => ({
    checkout: { sessions: { create: jest.fn() } },
    webhooks: { constructEvent: jest.fn() },
  })),
);

// ── Import models and routes AFTER mocks ─────────────────────────────
import { User } from "../../models/userSchema.js";
import { Course } from "../../models/courseSchema.js";
import { Enrollment } from "../../models/enrollmentSchema.js";
import { Payment } from "../../models/paymentSchema.js";
import courseRoute from "../../routes/courseRoute.js";
import quizRoute from "../../routes/quizRoute.js";
import adminCourseRoute from "../../routes/adminCourseRoute.js";
import errorHandler from "../../middlewares/errorHandler.js";

// ── Test App ─────────────────────────────────────────────────────────
function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api/v1/courses", courseRoute);
  app.use("/api/v1/quizzes", quizRoute);
  app.use("/api/v1/admin/courses", adminCourseRoute);
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
const validCourseBody = () => ({
  title: "Introduction to Fiqh",
  description:
    "A foundational course covering the principles of Islamic jurisprudence for new students.",
  category: "fiqh",
  level: "beginner",
  type: "self-paced",
  pricing: { type: "free" },
});

const validModuleBody = () => ({
  title: "Module 1: Fundamentals",
  description: "Core concepts",
  order: 0,
  lessons: [
    {
      title: "Lesson 1: What is Fiqh?",
      type: "text",
      content: { text: "Fiqh is Islamic jurisprudence..." },
      order: 0,
      isFree: true,
    },
    {
      title: "Lesson 2: Sources of Fiqh",
      type: "text",
      content: { text: "The primary sources of Fiqh are Quran and Sunnah..." },
      order: 1,
      isFree: false,
    },
  ],
});

const validQuizBody = () => ({
  title: "Module 1 Assessment",
  type: "quiz",
  passingScore: 60,
  maxAttempts: 3,
  timeLimit: 0,
  showCorrectAnswers: true,
  questions: [
    {
      text: "What does Fiqh mean?",
      type: "mcq",
      options: [
        { text: "Jurisprudence", isCorrect: true },
        { text: "Prayer", isCorrect: false },
        { text: "Fasting", isCorrect: false },
      ],
      points: 1,
    },
  ],
});

// ── Global state ─────────────────────────────────────────────────────
let mongoServer;
let app;
let scholar;
let scholar2;
let student;
let adminUser;
let courseSlug;         // main published free course
let mainFreeLessonId;   // free lesson in main course (isFree: true)
let mainPaidLessonId;   // paid lesson in main course (isFree: false)
let publishSlug;        // course created in test 9 (pending-review) → used by test 21
let paidCourseSlug;     // paid course for lesson-access tests 16-17
let paidCourseFreeLessonId;
let paidCoursePaidLessonId;
let quizId;
let attemptId;

// ── Lifecycle ────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongoServer.getUri());
  app = createApp();

  // Create test users
  [scholar, scholar2, student, adminUser] = await Promise.all([
    User.create({
      name: "Scholar A",
      username: "scholar_a",
      email: "scholar_a@smoke.test",
      password: "hashed_pw",
      role: "scholar",
    }),
    User.create({
      name: "Scholar B",
      username: "scholar_b",
      email: "scholar_b@smoke.test",
      password: "hashed_pw",
      role: "scholar",
    }),
    User.create({
      name: "Student User",
      username: "student_smoke",
      email: "student@smoke.test",
      password: "hashed_pw",
      role: "user",
    }),
    User.create({
      name: "Admin User",
      username: "admin_smoke",
      email: "admin@smoke.test",
      password: "hashed_pw",
      role: "admin",
    }),
  ]);

  // ── Set up main published free course (browse, get, update, enroll, quiz) ──
  const createRes = await request(app)
    .post("/api/v1/courses")
    .set(authHeader(scholar._id))
    .send(validCourseBody());
  courseSlug = createRes.body.course.slug;

  const addModRes = await request(app)
    .post(`/api/v1/courses/${courseSlug}/modules`)
    .set(authHeader(scholar._id))
    .send(validModuleBody());
  mainFreeLessonId = addModRes.body.course.modules[0].lessons[0]._id;
  mainPaidLessonId = addModRes.body.course.modules[0].lessons[1]._id;

  await request(app)
    .put(`/api/v1/courses/${courseSlug}/publish`)
    .set(authHeader(scholar._id));
  await request(app)
    .put(`/api/v1/admin/courses/${courseSlug}/review`)
    .set(authHeader(adminUser._id))
    .send({ decision: "approved" });

  // ── Set up paid course with free-preview + paid lessons (tests 16-17) ──
  const paidRes = await request(app)
    .post("/api/v1/courses")
    .set(authHeader(scholar._id))
    .send({
      title: "Advanced Hadith Sciences",
      description:
        "An in-depth study of hadith authentication methods and chain evaluation for advanced students.",
      category: "hadith",
      level: "advanced",
      type: "self-paced",
      pricing: { type: "paid", amount: 4999 },
    });
  paidCourseSlug = paidRes.body.course.slug;

  const paidModRes = await request(app)
    .post(`/api/v1/courses/${paidCourseSlug}/modules`)
    .set(authHeader(scholar._id))
    .send({
      title: "Module 1: Foundations",
      order: 0,
      lessons: [
        {
          title: "Free Preview: What are Hadith Sciences?",
          type: "text",
          content: { text: "Hadith sciences preview content..." },
          order: 0,
          isFree: true,
        },
        {
          title: "Chain Authentication Methods",
          type: "text",
          content: { text: "Premium hadith authentication content..." },
          order: 1,
          isFree: false,
        },
      ],
    });
  paidCourseFreeLessonId = paidModRes.body.course.modules[0].lessons[0]._id;
  paidCoursePaidLessonId = paidModRes.body.course.modules[0].lessons[1]._id;

  await request(app)
    .put(`/api/v1/courses/${paidCourseSlug}/publish`)
    .set(authHeader(scholar._id));
  await request(app)
    .put(`/api/v1/admin/courses/${paidCourseSlug}/review`)
    .set(authHeader(adminUser._id))
    .send({ decision: "approved" });
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30_000);

afterEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────
// COURSE CRUD (tests 1–10)
// ─────────────────────────────────────────────────────────────────────

describe("Course CRUD", () => {
  it("1. Unauthenticated POST /api/v1/courses → 401", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .send(validCourseBody());
    expect(res.status).toBe(401);
  });

  it("2. Authenticated non-scholar POST /api/v1/courses → 403", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(student._id))
      .send(validCourseBody());
    expect(res.status).toBe(403);
  });

  it("3. Scholar POST /api/v1/courses with valid body → 201, returns course with generated slug", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Tafseer Fundamentals",
        description:
          "A comprehensive introduction to Quranic exegesis and its methodologies for students of knowledge.",
        category: "quran",
        level: "intermediate",
        type: "self-paced",
        pricing: { type: "free" },
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.course).toBeDefined();
    expect(res.body.course.slug).toMatch(/tafseer-fundamentals/);
  });

  it("4. GET /api/v1/courses → 200, returns paginated courses", async () => {
    const res = await request(app).get("/api/v1/courses");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty("page");
    expect(res.body.pagination).toHaveProperty("total");
  });

  it("5. GET /api/v1/courses?category=fiqh → 200, only fiqh courses", async () => {
    const res = await request(app)
      .get("/api/v1/courses")
      .query({ category: "fiqh" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const c of res.body.courses) {
      expect(c.category).toBe("fiqh");
    }
  });

  it("6. GET /api/v1/courses/:slug → 200, includes instructor info", async () => {
    const res = await request(app).get(`/api/v1/courses/${courseSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.course.slug).toBe(courseSlug);
    expect(res.body.course.instructor).toBeDefined();
    expect(res.body.course.instructor.name).toBeDefined();
    expect(res.body.course.instructor.username).toBeDefined();
    expect(res.body.isEnrolled).toBe(false);
  });

  it("7. Scholar PUT /api/v1/courses/:slug → 200, update succeeds for owner", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}`)
      .set(authHeader(scholar._id))
      .send({
        description:
          "Updated description covering the classical approaches to fiqh across all major madhabs.",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.description).toMatch(/Updated description/);
  });

  it("8. Different scholar PUT /api/v1/courses/:slug → 403 (not owner)", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}`)
      .set(authHeader(scholar2._id))
      .send({ description: "Should not be allowed" });

    expect(res.status).toBe(403);
  });

  it("9. Scholar PUT /api/v1/courses/:slug/publish → 200, status becomes pending-review", async () => {
    // Create a new draft course, add module, then publish
    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Seerah Studies",
        description:
          "A complete study of the life of Prophet Muhammad (PBUH) for students of all levels.",
        category: "seerah",
        level: "beginner",
        type: "self-paced",
        pricing: { type: "free" },
      });
    publishSlug = createRes.body.course.slug;

    await request(app)
      .post(`/api/v1/courses/${publishSlug}/modules`)
      .set(authHeader(scholar._id))
      .send({
        title: "Module 1",
        order: 0,
        lessons: [
          { title: "L1", type: "text", content: { text: "..." }, order: 0 },
        ],
      });

    const res = await request(app)
      .put(`/api/v1/courses/${publishSlug}/publish`)
      .set(authHeader(scholar._id));

    expect(res.status).toBe(200);
    expect(res.body.course.status).toBe("pending-review");
  });

  it("10. Scholar PUT /api/v1/courses/:slug/publish (no modules) → 400", async () => {
    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Empty Course",
        description:
          "This course has no modules and should fail to publish when attempted.",
        category: "aqeedah",
        level: "beginner",
        type: "self-paced",
        pricing: { type: "free" },
      });

    const emptySlug = createRes.body.course.slug;

    const res = await request(app)
      .put(`/api/v1/courses/${emptySlug}/publish`)
      .set(authHeader(scholar._id));

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ENROLLMENT (tests 11–17)
// ─────────────────────────────────────────────────────────────────────

describe("Enrollment", () => {
  it("11. Authenticated POST /api/v1/courses/:slug/enroll (free course) → 200", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/enroll`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.enrollment).toBeDefined();
    expect(res.body.enrollment.status).toBe("active");
  });

  it("12. POST /api/v1/courses/:slug/enroll again → 400 (already enrolled)", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/enroll`)
      .set(authHeader(student._id));

    expect(res.status).toBe(400);
  });

  it("13. GET /api/v1/courses/:slug/progress → 200, percentComplete=0", async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${courseSlug}/progress`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progress.percentComplete).toBe(0);
    expect(res.body.enrollment.progress.completedLessons).toHaveLength(0);
  });

  it("14. PUT /api/v1/courses/:slug/progress { lessonId, completed: true } → 200, percentComplete updated", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}/progress`)
      .set(authHeader(student._id))
      .send({ lessonId: mainFreeLessonId, completed: true });

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progress.completedLessons).toContain(
      mainFreeLessonId,
    );
    // 1 of 2 lessons = 50%
    expect(res.body.enrollment.progress.percentComplete).toBe(50);
  });

  it("15. GET /api/v1/courses/:slug/lessons/:lessonId (enrolled) → 200", async () => {
    // Access the non-free lesson — requires active enrollment
    const res = await request(app)
      .get(`/api/v1/courses/${courseSlug}/lessons/${mainPaidLessonId}`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.lesson).toBeDefined();
    expect(res.body.lesson.title).toBe("Lesson 2: Sources of Fiqh");
  });

  it("16. GET /api/v1/courses/:slug/lessons/:lessonId (not enrolled, paid lesson) → 403", async () => {
    // Student is not enrolled in the paid course — paid lesson should be blocked
    const res = await request(app)
      .get(
        `/api/v1/courses/${paidCourseSlug}/lessons/${paidCoursePaidLessonId}`,
      )
      .set(authHeader(student._id));

    expect(res.status).toBe(403);
  });

  it("17. GET /api/v1/courses/:slug/lessons/:lessonId (not enrolled, free preview) → 200", async () => {
    // Student is not enrolled in the paid course — but lesson is a free preview
    const res = await request(app)
      .get(
        `/api/v1/courses/${paidCourseSlug}/lessons/${paidCourseFreeLessonId}`,
      )
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.lesson).toBeDefined();
    expect(res.body.lesson.title).toMatch(/Free Preview/);
  });

  it("enforces maxStudents end-to-end once course capacity is full", async () => {
    const [firstStudent, secondStudent] = await Promise.all([
      User.create({
        name: "Capacity Student One",
        username: "capacity_student_one",
        email: "capacity1@smoke.test",
        password: "hashed_pw",
        role: "user",
      }),
      User.create({
        name: "Capacity Student Two",
        username: "capacity_student_two",
        email: "capacity2@smoke.test",
        password: "hashed_pw",
        role: "user",
      }),
    ]);

    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Limited Seats Aqeedah",
        description: "A tightly capped class to verify enrollment capacity enforcement.",
        category: "aqeedah",
        level: "beginner",
        type: "self-paced",
        pricing: { type: "free" },
        maxStudents: 1,
      });
    const limitedSlug = createRes.body.course.slug;

    await request(app)
      .post(`/api/v1/courses/${limitedSlug}/modules`)
      .set(authHeader(scholar._id))
      .send(validModuleBody());
    await request(app)
      .put(`/api/v1/courses/${limitedSlug}/publish`)
      .set(authHeader(scholar._id));
    await request(app)
      .put(`/api/v1/admin/courses/${limitedSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });

    const firstEnrollRes = await request(app)
      .post(`/api/v1/courses/${limitedSlug}/enroll`)
      .set(authHeader(firstStudent._id));
    const secondEnrollRes = await request(app)
      .post(`/api/v1/courses/${limitedSlug}/enroll`)
      .set(authHeader(secondStudent._id));

    expect(firstEnrollRes.status).toBe(200);
    expect(secondEnrollRes.status).toBe(400);
    expect(secondEnrollRes.body.message).toMatch(/maximum number of students/i);
  });

  it("rejects enrollments that reuse another user's payment session", async () => {
    const [payer, attacker] = await Promise.all([
      User.create({
        name: "Legit Payer",
        username: "legit_payer",
        email: "payer@smoke.test",
        password: "hashed_pw",
        role: "user",
      }),
      User.create({
        name: "Payment Attacker",
        username: "payment_attacker",
        email: "attacker@smoke.test",
        password: "hashed_pw",
        role: "user",
      }),
    ]);

    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Paid Tajweed Intensive",
        description: "A paid course used to verify payment ownership checks during enrollment.",
        category: "tajweed",
        level: "intermediate",
        type: "self-paced",
        pricing: { type: "paid", amount: 9900, currency: "usd" },
      });
    const paidSlug = createRes.body.course.slug;
    const paidCourse = await Course.findOne({ slug: paidSlug }).lean();

    await request(app)
      .post(`/api/v1/courses/${paidSlug}/modules`)
      .set(authHeader(scholar._id))
      .send(validModuleBody());
    await request(app)
      .put(`/api/v1/courses/${paidSlug}/publish`)
      .set(authHeader(scholar._id));
    await request(app)
      .put(`/api/v1/admin/courses/${paidSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });

    await Payment.create({
      user: payer._id,
      type: "course-purchase",
      stripeSessionId: "sess_stolen_payment",
      stripePaymentIntentId: "pi_stolen_payment",
      amount: 9900,
      currency: "usd",
      status: "completed",
      course: paidCourse._id,
    });

    const res = await request(app)
      .post(`/api/v1/courses/${paidSlug}/enroll`)
      .set(authHeader(attacker._id))
      .send({ paymentSessionId: "sess_stolen_payment" });

    expect(res.status).toBe(402);
    expect(res.body.message).toMatch(/payment required/i);
  });
});

// ─────────────────────────────────────────────────────────────────────
// QUIZ (tests 18–20)
// ─────────────────────────────────────────────────────────────────────

describe("Quiz", () => {
  beforeAll(async () => {
    // Create a quiz on the main course for the student to take
    const quizRes = await request(app)
      .post(`/api/v1/courses/${courseSlug}/quizzes`)
      .set(authHeader(scholar._id))
      .send(validQuizBody());
    quizId = quizRes.body.quiz._id;
  });

  it("18. POST /api/v1/quizzes/:id/start (enrolled) → 200, questions without answers", async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/start`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.quiz).toHaveProperty("timeLimit");
    expect(res.body.quiz).toHaveProperty("totalQuestions", 1);
    expect(res.body.attempt).toBeDefined();
    expect(res.body.attempt).toHaveProperty("_id");
    expect(res.body.attempt).toHaveProperty("attempt", 1);
    expect(res.body.questions).toHaveLength(1);
    // Correct answers must be stripped
    for (const q of res.body.questions) {
      if (q.options) {
        for (const opt of q.options) {
          expect(opt).not.toHaveProperty("isCorrect");
        }
      }
    }
    attemptId = res.body.attempt._id;
  });

  it("19. POST /api/v1/quizzes/:id/submit → 200, scored and graded", async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/submit`)
      .set(authHeader(student._id))
      .send({
        attemptId,
        answers: [{ questionIndex: 0, answer: 0 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.attempt).toBeDefined();
    expect(res.body.attempt).toHaveProperty("_id", attemptId);
    expect(res.body.score).toBe(100);
    expect(res.body.passed).toBe(true);
    expect(res.body.earnedPoints).toBe(1);
    expect(res.body.totalPoints).toBe(1);
    expect(res.body.answers).toHaveLength(1);
  });

  it("20. GET /api/v1/quizzes/:id/results → 200, attempts list", async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes/${quizId}/results`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.attempts).toBeDefined();
    expect(Array.isArray(res.body.attempts)).toBe(true);
    expect(res.body.attemptsUsed).toBe(1);
    expect(res.body.attemptsRemaining).toBeGreaterThanOrEqual(0);
    expect(res.body.bestScore).toBe(100);
    expect(res.body.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN (tests 21–22)
// ─────────────────────────────────────────────────────────────────────

describe("Admin", () => {
  it("21. Admin PUT /api/v1/admin/courses/:slug/review decision=approved → 200, status=published", async () => {
    // publishSlug was set to pending-review in test 9
    const res = await request(app)
      .put(`/api/v1/admin/courses/${publishSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.status).toBe("published");
  });

  it("22. Non-admin PUT /api/v1/admin/courses/:slug/review → 403", async () => {
    // Create a fresh pending-review course for this test
    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Admin Test Course",
        description:
          "Temporary course created only for validating admin access control on review endpoints.",
        category: "aqeedah",
        level: "beginner",
        type: "self-paced",
        pricing: { type: "free" },
      });
    const tempSlug = createRes.body.course.slug;

    await request(app)
      .post(`/api/v1/courses/${tempSlug}/modules`)
      .set(authHeader(scholar._id))
      .send({
        title: "Module 1",
        order: 0,
        lessons: [
          { title: "L1", type: "text", content: { text: "..." }, order: 0 },
        ],
      });
    await request(app)
      .put(`/api/v1/courses/${tempSlug}/publish`)
      .set(authHeader(scholar._id));

    const res = await request(app)
      .put(`/api/v1/admin/courses/${tempSlug}/review`)
      .set(authHeader(student._id))
      .send({ decision: "approved" });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────
// DISCOVERY (tests 23–25)
// ─────────────────────────────────────────────────────────────────────

describe("Discovery", () => {
  it("23. GET /api/v1/courses/featured → 200", async () => {
    const res = await request(app).get("/api/v1/courses/featured");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.courses)).toBe(true);
  });

  it("24. GET /api/v1/courses/my-courses (enrolled student) → 200", async () => {
    const res = await request(app)
      .get("/api/v1/courses/my-courses")
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.enrollments).toBeDefined();
    expect(res.body.enrollments.length).toBeGreaterThanOrEqual(1);
  });

  it("25. GET /api/v1/courses/teaching (scholar) → 200", async () => {
    const res = await request(app)
      .get("/api/v1/courses/teaching")
      .set(authHeader(scholar._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.courses).toBeDefined();
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
  });
});
