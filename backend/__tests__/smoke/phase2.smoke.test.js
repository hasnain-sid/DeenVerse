/**
 * Phase 2 Smoke / Integration Tests
 *
 * Tests all Phase-2 API endpoints (Course CRUD, Enrollment, Quiz, Admin Review)
 * against a lightweight Express app backed by mongodb-memory-server.
 *
 * Stripe, Redis, and notification calls are fully mocked.
 * 25 tests covering the requirements from TASK-064.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
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

// ── Suppress logger output ────────────────────────────────────────────
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

// ── Mock Stripe (only needed for paid-course tests) ──────────────────
const mockCheckoutCreate = jest.fn();
jest.mock("stripe", () =>
  jest.fn(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    webhooks: { constructEvent: jest.fn() },
  })),
);

// ── Import models and routes AFTER mocks ─────────────────────────────
import { User } from "../../models/userSchema.js";
import { Course } from "../../models/courseSchema.js";
import { Enrollment } from "../../models/enrollmentSchema.js";
import courseRoute from "../../routes/courseRoute.js";
import quizRoute from "../../routes/quizRoute.js";
import adminCourseRoute from "../../routes/adminCourseRoute.js";
import errorHandler from "../../middlewares/errorHandler.js";

// ── Test App ──────────────────────────────────────────────────────────
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

// ── Token helpers ─────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

function authHeader(userId) {
  return { Authorization: `Bearer ${signToken(userId)}` };
}

// ── Test fixtures ─────────────────────────────────────────────────────
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
  lessons: [
    {
      title: "Lesson 1: What is Fiqh?",
      type: "text",
      content: { text: "Fiqh is Islamic jurisprudence..." },
      order: 0,
      isFree: true,
    },
  ],
});

const validQuizBody = () => ({
  title: "Module 1 Assessment",
  type: "quiz",
  passingScore: 60,
  maxAttempts: 3,
  timeLimit: 0, // no time limit
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

// ── Global state ──────────────────────────────────────────────────────
let mongoServer;
let app;
let scholar;
let student;
let adminUser;
let courseSlug;
let quizId;
let attemptId;

// ── Lifecycle ─────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();

  // Create test users
  [scholar, student, adminUser] = await Promise.all([
    User.create({
      name: "Scholar User",
      username: "scholar_smoke",
      email: "scholar@smoke.test",
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
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30_000);

afterEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────
// AUTH GUARDS
// ─────────────────────────────────────────────────────────────────────

describe("Auth guards", () => {
  // Test 1
  it("1. POST /api/v1/courses without auth → 401", async () => {
    const res = await request(app).post("/api/v1/courses").send(validCourseBody());
    expect(res.status).toBe(401);
  });

  // Test 2
  it("2. POST /api/v1/courses with regular-user token → 403 (scholar required)", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(student._id))
      .send(validCourseBody());
    expect(res.status).toBe(403);
  });

  // Test 3
  it("3. GET /api/v1/admin/courses without auth → 401", async () => {
    const res = await request(app).get("/api/v1/admin/courses");
    expect(res.status).toBe(401);
  });

  // Test 4
  it("4. GET /api/v1/admin/courses with scholar token → 403 (admin required)", async () => {
    const res = await request(app)
      .get("/api/v1/admin/courses")
      .set(authHeader(scholar._id));
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────
// COURSE CRUD
// ─────────────────────────────────────────────────────────────────────

describe("Course CRUD", () => {
  // Test 5
  it("5. Scholar POST /api/v1/courses → 201, returns course with slug", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send(validCourseBody());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.course).toBeDefined();
    expect(res.body.course.slug).toMatch(/introduction-to-fiqh/);
    courseSlug = res.body.course.slug;
  });

  // Test 6
  it("6. GET /api/v1/courses (browse) → 200, zero published courses", async () => {
    const res = await request(app).get("/api/v1/courses");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.courses).toHaveLength(0); // course is still draft
    expect(res.body.pagination).toBeDefined();
  });

  // Test 7
  it("7. GET /api/v1/courses/:slug → 200, returns draft course details", async () => {
    const res = await request(app).get(`/api/v1/courses/${courseSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.course.slug).toBe(courseSlug);
    expect(res.body.isEnrolled).toBe(false);
  });

  // Test 8
  it("8. PUT /api/v1/courses/:slug by owner → 200, updates description", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}`)
      .set(authHeader(scholar._id))
      .send({ description: "Updated description for the Fiqh course covering all madhabs." });

    expect(res.status).toBe(200);
    expect(res.body.course.description).toMatch(/Updated description/);
  });

  // Test 9
  it("9. PUT /api/v1/courses/:slug by non-owner → 403", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}`)
      .set(authHeader(student._id))
      .send({ description: "Hacked" });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────
// MODULE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

describe("Module management", () => {
  // Test 10
  it("10. POST /api/v1/courses/:slug/modules → 201, adds module with lesson", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/modules`)
      .set(authHeader(scholar._id))
      .send(validModuleBody());

    expect(res.status).toBe(201);
    expect(res.body.course.modules).toHaveLength(1);
    expect(res.body.course.modules[0].title).toBe("Module 1: Fundamentals");
    expect(res.body.course.modules[0].lessons).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// PUBLISH + ADMIN REVIEW FLOW
// ─────────────────────────────────────────────────────────────────────

describe("Publish and admin review flow", () => {
  // Test 11
  it("11. PUT /api/v1/courses/:slug/publish → 200, status becomes pending-review", async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}/publish`)
      .set(authHeader(scholar._id));

    expect(res.status).toBe(200);
    expect(res.body.course.status).toBe("pending-review");
  });

  // Test 12
  it("12. GET /api/v1/admin/courses (admin) → 200, shows pending course", async () => {
    const res = await request(app)
      .get("/api/v1/admin/courses")
      .set(authHeader(adminUser._id))
      .query({ status: "pending-review" });

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.courses[0].slug).toBe(courseSlug);
  });

  // Test 13
  it("13. PUT /api/v1/admin/courses/:slug/review (approve) → 200, status becomes published", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/courses/${courseSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.course.status).toBe("published");
  });

  // Test 14
  it("14. GET /api/v1/courses (browse) after approval → 200, returns published course", async () => {
    const res = await request(app).get("/api/v1/courses");

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.courses[0].slug).toBe(courseSlug);
  });

  // Test 15
  it("15. PUT /api/v1/admin/courses/:slug/review on published course → 400 (not pending)", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/courses/${courseSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ENROLLMENT AND PROGRESS
// ─────────────────────────────────────────────────────────────────────

describe("Enrollment and progress", () => {
  // Test 16
  it("16. POST /api/v1/courses/:slug/enroll → 200, student enrolled", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/enroll`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.enrollment).toBeDefined();
    expect(res.body.enrollment.status).toBe("active");
  });

  // Test 17
  it("17. POST /api/v1/courses/:slug/enroll again → 400 (already enrolled)", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/enroll`)
      .set(authHeader(student._id));

    expect(res.status).toBe(400);
  });

  // Test 18
  it("18. GET /api/v1/courses/:slug/progress → 200, progress starts at 0%", async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${courseSlug}/progress`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progress.percentComplete).toBe(0);
    expect(res.body.enrollment.progress.completedLessons).toHaveLength(0);
  });

  // Test 19
  it("19. PUT /api/v1/courses/:slug/progress → 200, marks lesson complete", async () => {
    // Get the lesson ID from the course
    const courseRes = await request(app).get(`/api/v1/courses/${courseSlug}`);
    const lessonId = courseRes.body.course.modules[0].lessons[0]._id;

    const res = await request(app)
      .put(`/api/v1/courses/${courseSlug}/progress`)
      .set(authHeader(student._id))
      .send({ lessonId, completed: true });

    expect(res.status).toBe(200);
    expect(res.body.enrollment.progress.completedLessons).toContain(lessonId);
    expect(res.body.enrollment.progress.percentComplete).toBe(100); // 1/1 lesson = 100%
    expect(res.body.enrollment.status).toBe("completed");
  });

  // Test 20
  it("20. GET /api/v1/courses/my-courses (auth) → 200, shows enrolled course", async () => {
    const res = await request(app)
      .get("/api/v1/courses/my-courses")
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.enrollments.length).toBeGreaterThanOrEqual(1);
  });

  // Test 21
  it("21. GET /api/v1/courses/my-courses without auth → 401", async () => {
    const res = await request(app).get("/api/v1/courses/my-courses");
    expect(res.status).toBe(401);
  });

  // Test 22
  it("22. GET /api/v1/courses/teaching (scholar) → 200, shows created course", async () => {
    const res = await request(app)
      .get("/api/v1/courses/teaching")
      .set(authHeader(scholar._id));

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// QUIZ FLOW
// ─────────────────────────────────────────────────────────────────────

describe("Quiz flow", () => {
  // Reset enrollment to active (test 19 completed it at 100% progress)
  beforeAll(async () => {
    const course = await Course.findOne({ slug: courseSlug }).lean();
    await Enrollment.updateOne(
      { student: student._id, course: course._id },
      { $set: { status: "active" } },
    );
  });

  // Test 23
  it("23. POST /api/v1/courses/:slug/quizzes (scholar) → 201, quiz created", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseSlug}/quizzes`)
      .set(authHeader(scholar._id))
      .send(validQuizBody());

    expect(res.status).toBe(201);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.quiz.title).toBe("Module 1 Assessment");
    quizId = res.body.quiz._id;
  });

  // Test 24
  it("24. POST /api/v1/quizzes/:quizId/start → 200, strips correct answers", async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/start`)
      .set(authHeader(student._id));

    expect(res.status).toBe(200);
    expect(res.body.attempt).toBeDefined();
    expect(res.body.questions).toHaveLength(1);
    // Correct answers must be stripped
    for (const q of res.body.questions) {
      if (q.options) {
        for (const opt of q.options) {
          expect(opt).not.toHaveProperty("isCorrect");
        }
      }
    }
    attemptId = res.body.attempt.id;
  });

  // Test 25
  it("25. POST /api/v1/quizzes/:quizId/submit → 200, graded correctly, GET results confirms pass", async () => {
    // Correct answer for Q0 (MCQ) is index 0 ("Jurisprudence")
    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${quizId}/submit`)
      .set(authHeader(student._id))
      .send({
        attemptId,
        answers: [{ questionIndex: 0, answer: 0 }],
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.score).toBe(100); // 1/1 correct = 100%
    expect(submitRes.body.passed).toBe(true);

    // Verify results endpoint also reflects the pass
    const resultsRes = await request(app)
      .get(`/api/v1/quizzes/${quizId}/results`)
      .set(authHeader(student._id));

    expect(resultsRes.status).toBe(200);
    expect(resultsRes.body.passed).toBe(true);
    expect(resultsRes.body.bestScore).toBe(100);
    expect(resultsRes.body.attemptsUsed).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// PAID COURSE ENROLLMENT
// ─────────────────────────────────────────────────────────────────────

describe("Paid course enrollment", () => {
  let paidCourseSlug;

  beforeAll(async () => {
    // Scholar creates a paid course, admin approves it
    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Advanced Hadith Sciences",
        description:
          "An in-depth study of hadith sciences, authentication methods and chain evaluation for advanced students.",
        category: "hadith",
        level: "advanced",
        type: "self-paced",
        pricing: { type: "paid", amount: 4999 },
      });

    paidCourseSlug = createRes.body.course.slug;

    // Add module + lesson then publish
    await request(app)
      .post(`/api/v1/courses/${paidCourseSlug}/modules`)
      .set(authHeader(scholar._id))
      .send({
        title: "Module 1",
        lessons: [{ title: "L1", type: "text", content: { text: "..." }, order: 0 }],
      });

    await request(app)
      .put(`/api/v1/courses/${paidCourseSlug}/publish`)
      .set(authHeader(scholar._id));

    await request(app)
      .put(`/api/v1/admin/courses/${paidCourseSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "approved" });
  });

  it("POST /api/v1/courses/:slug/enroll for paid course without payment → 402", async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${paidCourseSlug}/enroll`)
      .set(authHeader(student._id));

    expect(res.status).toBe(402);
  });
});

// ─────────────────────────────────────────────────────────────────────
// FEATURED + SEARCH
// ─────────────────────────────────────────────────────────────────────

describe("Featured and search", () => {
  it("GET /api/v1/courses/featured → 200", async () => {
    const res = await request(app).get("/api/v1/courses/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.courses)).toBe(true);
  });

  it("GET /api/v1/courses?category=fiqh → 200, paginated", async () => {
    const res = await request(app)
      .get("/api/v1/courses")
      .query({ category: "fiqh", page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 });
    for (const c of res.body.courses) {
      expect(c.category).toBe("fiqh");
    }
  });

  it("GET /api/v1/courses?search=Fiqh → 200, matches course title", async () => {
    const res = await request(app)
      .get("/api/v1/courses")
      .query({ search: "Fiqh" });

    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN REJECTION FLOW
// ─────────────────────────────────────────────────────────────────────

describe("Admin rejection flow", () => {
  let secondCourseSlug;

  beforeAll(async () => {
    // Create + add content + publish a second course to test rejection
    const createRes = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(scholar._id))
      .send({
        title: "Seerah for Beginners",
        description: "An introductory course on the life of Prophet Muhammad (PBUH) for new Muslims.",
        category: "seerah",
        level: "beginner",
        type: "self-paced",
      });

    secondCourseSlug = createRes.body.course.slug;

    await request(app)
      .post(`/api/v1/courses/${secondCourseSlug}/modules`)
      .set(authHeader(scholar._id))
      .send({
        title: "Module 1",
        lessons: [{ title: "L1", type: "text", content: { text: "..." }, order: 0 }],
      });

    await request(app)
      .put(`/api/v1/courses/${secondCourseSlug}/publish`)
      .set(authHeader(scholar._id));
  });

  it("PUT /api/v1/admin/courses/:slug/review (reject) → 200, status returns to draft", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/courses/${secondCourseSlug}/review`)
      .set(authHeader(adminUser._id))
      .send({ decision: "rejected", reason: "Content is too brief" });

    expect(res.status).toBe(200);
    expect(res.body.course.status).toBe("draft");
    expect(res.body.course.rejectionReason).toBe("Content is too brief");
  });
});
