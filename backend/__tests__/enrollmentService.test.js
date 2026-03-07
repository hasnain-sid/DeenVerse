import {
  enrollInCourse,
  updateProgress,
  getLessonContent,
} from "../services/courseService.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────

jest.mock("../models/courseSchema.js", () => ({
  Course: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../models/paymentSchema.js", () => ({
  Payment: { findOne: jest.fn() },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { updateOne: jest.fn(), findById: jest.fn() },
}));

jest.mock("../config/redis.js", () => ({
  getRedisClient: jest.fn(),
  isRedisConnected: jest.fn(() => false),
}));

jest.mock("../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────

const COURSE_ID = "c00000000000000000000001";
const USER_ID = "u00000000000000000000001";
const INSTRUCTOR_ID = "i00000000000000000000001";

function makeCourse(overrides = {}) {
  return {
    _id: COURSE_ID,
    slug: "test-course",
    status: "published",
    pricing: { type: "free", amount: 0 },
    enrollmentCount: 5,
    maxStudents: 0,
    instructor: INSTRUCTOR_ID,
    modules: [
      {
        title: "Module 1",
        lessons: [
          { _id: "lesson-1", title: "Intro", type: "video", isFree: true },
          { _id: "lesson-2", title: "Core", type: "video", isFree: false },
        ],
      },
      {
        title: "Module 2",
        lessons: [
          { _id: "lesson-3", title: "Advanced", type: "text", isFree: false },
        ],
      },
    ],
    ...overrides,
  };
}

function makeEnrollmentDoc(overrides = {}) {
  const doc = {
    _id: "enr001",
    student: USER_ID,
    course: COURSE_ID,
    status: "active",
    progress: {
      completedLessons: [],
      currentModule: 0,
      currentLesson: 0,
      percentComplete: 0,
      lastAccessedAt: null,
    },
    enrolledAt: new Date(),
    completedAt: undefined,
    save: jest.fn().mockResolvedValue(undefined),
    toObject() {
      const { save, toObject, ...rest } = this;
      return rest;
    },
    ...overrides,
  };
  return doc;
}

// ── Tests ───────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ────── enrollInCourse ──────────────────────────────

describe("enrollInCourse", () => {
  it("creates enrollment successfully for a free course", async () => {
    const course = makeCourse();
    Course.findOne.mockResolvedValue(course);
    Enrollment.findOne.mockResolvedValue(null);
    const fakeEnrollment = makeEnrollmentDoc();
    Enrollment.create.mockResolvedValue(fakeEnrollment);
    Course.updateOne.mockResolvedValue({});
    User.updateOne.mockResolvedValue({});

    const result = await enrollInCourse(USER_ID, "test-course");

    expect(Enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student: USER_ID,
        course: COURSE_ID,
        status: "active",
      })
    );
    expect(Course.updateOne).toHaveBeenCalledWith(
      { _id: COURSE_ID },
      { $inc: { enrollmentCount: 1 } }
    );
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: INSTRUCTOR_ID },
      { $inc: { "scholarProfile.totalStudents": 1 } }
    );
    expect(result).toEqual({ enrollment: fakeEnrollment });
  });

  it("rejects duplicate enrollment (400)", async () => {
    Course.findOne.mockResolvedValue(makeCourse());
    Enrollment.findOne.mockResolvedValue(makeEnrollmentDoc());

    await expect(enrollInCourse(USER_ID, "test-course")).rejects.toThrow(AppError);
    await expect(enrollInCourse(USER_ID, "test-course")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects paid course without payment session (402)", async () => {
    const paidCourse = makeCourse({ pricing: { type: "paid", amount: 49 }, autoEnroll: false });
    Course.findOne.mockResolvedValue(paidCourse);
    Enrollment.findOne.mockResolvedValue(null);

    await expect(enrollInCourse(USER_ID, "test-course")).rejects.toThrow(AppError);
    await expect(enrollInCourse(USER_ID, "test-course")).rejects.toMatchObject({
      statusCode: 402,
    });
  });

  it("succeeds for paid course with valid payment session", async () => {
    const paidCourse = makeCourse({ pricing: { type: "paid", amount: 49 }, autoEnroll: false });
    Course.findOne.mockResolvedValue(paidCourse);
    Enrollment.findOne.mockResolvedValue(null);
    Payment.findOne.mockResolvedValue({
      stripePaymentIntentId: "pi_123",
      amount: 49,
    });
    const fakeEnrollment = makeEnrollmentDoc();
    Enrollment.create.mockResolvedValue(fakeEnrollment);
    Course.updateOne.mockResolvedValue({});
    User.updateOne.mockResolvedValue({});

    const result = await enrollInCourse(USER_ID, "test-course", "sess_abc");

    expect(Payment.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "sess_abc",
        status: "completed",
        course: COURSE_ID,
      })
    );
    expect(Enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment: expect.objectContaining({
          stripePaymentId: "pi_123",
          amount: 49,
        }),
      })
    );
    expect(result).toEqual({ enrollment: fakeEnrollment });
  });
});

// ────── updateProgress ──────────────────────────────

describe("updateProgress", () => {
  it("adds lesson to completedLessons and recalculates percentComplete", async () => {
    const course = makeCourse(); // 3 lessons total
    const enrollDoc = makeEnrollmentDoc();
    Enrollment.findById.mockResolvedValue(enrollDoc);

    const result = await updateProgress(
      USER_ID, "test-course", "lesson-1", true, enrollDoc, course
    );

    expect(enrollDoc.progress.completedLessons).toContain("lesson-1");
    // 1 of 3 lessons = 33%
    expect(enrollDoc.progress.percentComplete).toBe(33);
    expect(enrollDoc.save).toHaveBeenCalled();
    expect(result.enrollment).toBeDefined();
  });

  it("does not duplicate lesson if already completed", async () => {
    const course = makeCourse();
    const enrollDoc = makeEnrollmentDoc({
      progress: {
        completedLessons: ["lesson-1"],
        currentModule: 0,
        currentLesson: 0,
        percentComplete: 33,
        lastAccessedAt: null,
      },
    });
    Enrollment.findById.mockResolvedValue(enrollDoc);

    await updateProgress(USER_ID, "test-course", "lesson-1", true, enrollDoc, course);

    // Should still have exactly one entry
    const count = enrollDoc.progress.completedLessons.filter(
      (id) => id === "lesson-1"
    ).length;
    expect(count).toBe(1);
  });

  it("marks enrollment as completed when 100%", async () => {
    const course = makeCourse();
    const enrollDoc = makeEnrollmentDoc({
      progress: {
        completedLessons: ["lesson-1", "lesson-2"],
        currentModule: 0,
        currentLesson: 0,
        percentComplete: 67,
        lastAccessedAt: null,
      },
    });
    Enrollment.findById.mockResolvedValue(enrollDoc);

    await updateProgress(USER_ID, "test-course", "lesson-3", true, enrollDoc, course);

    expect(enrollDoc.progress.percentComplete).toBe(100);
    expect(enrollDoc.status).toBe("completed");
    expect(enrollDoc.completedAt).toBeInstanceOf(Date);
  });
});

// ────── getLessonContent ────────────────────────────

describe("getLessonContent", () => {
  function mockCourseWithLean(course) {
    course.modules[0].lessons[0]._id = { toString: () => "lesson-1" };
    course.modules[0].lessons[1]._id = { toString: () => "lesson-2" };
    course.modules[1].lessons[0]._id = { toString: () => "lesson-3" };
    Course.findOne.mockReturnValue({ lean: () => Promise.resolve(course) });
  }

  it("serves free preview to non-enrolled user", async () => {
    const course = makeCourse();
    mockCourseWithLean(course);

    // lesson-1 is isFree: true — no enrollment check needed
    const result = await getLessonContent(USER_ID, "test-course", "lesson-1");

    expect(Enrollment.findOne).not.toHaveBeenCalled();
    expect(result.lesson).toMatchObject({ title: "Intro", isFree: true });
  });

  it("blocks paid lesson for non-enrolled user (403)", async () => {
    const course = makeCourse();
    mockCourseWithLean(course);
    Enrollment.findOne.mockResolvedValue(null); // not enrolled

    await expect(
      getLessonContent(USER_ID, "test-course", "lesson-2")
    ).rejects.toThrow(AppError);
    await expect(
      getLessonContent(USER_ID, "test-course", "lesson-2")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("serves paid lesson to enrolled user", async () => {
    const course = makeCourse();
    mockCourseWithLean(course);
    Enrollment.findOne.mockResolvedValue(makeEnrollmentDoc()); // enrolled

    const result = await getLessonContent(USER_ID, "test-course", "lesson-2");

    expect(result.lesson).toMatchObject({ title: "Core", isFree: false });
  });
});
