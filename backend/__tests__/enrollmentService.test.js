import mongoose from "mongoose";
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
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
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

let session;

beforeEach(() => {
  jest.clearAllMocks();
  session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
  };
  jest.spyOn(mongoose, "startSession").mockResolvedValue(session);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ────── enrollInCourse ──────────────────────────────

describe("enrollInCourse", () => {
  it("creates enrollment successfully for a free course", async () => {
    const course = makeCourse();
    Course.findOne.mockResolvedValue(course);
    Enrollment.findOne.mockResolvedValue(null);
    const fakeEnrollment = makeEnrollmentDoc();
    Course.findOneAndUpdate.mockResolvedValue({ ...course, enrollmentCount: 6 });
    Enrollment.create.mockResolvedValue([fakeEnrollment]);
    User.updateOne.mockResolvedValue({});

    const result = await enrollInCourse(USER_ID, "test-course");

    expect(session.startTransaction).toHaveBeenCalled();
    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: COURSE_ID },
      { $inc: { enrollmentCount: 1 } },
      { new: true, session }
    );
    expect(Enrollment.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          student: USER_ID,
          course: COURSE_ID,
          status: "active",
        }),
      ],
      { session }
    );
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: INSTRUCTOR_ID },
      { $inc: { "scholarProfile.totalStudents": 1 } },
      { session }
    );
    expect(session.commitTransaction).toHaveBeenCalled();
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
    Course.findOneAndUpdate.mockResolvedValue({ ...paidCourse, enrollmentCount: 6 });
    Enrollment.create.mockResolvedValue([fakeEnrollment]);
    User.updateOne.mockResolvedValue({});

    const result = await enrollInCourse(USER_ID, "test-course", "sess_abc");

    expect(Payment.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "sess_abc",
        status: "completed",
        course: COURSE_ID,
        user: USER_ID,
      })
    );
    expect(Enrollment.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          payment: expect.objectContaining({
            stripePaymentId: "pi_123",
            amount: 49,
          }),
        }),
      ],
      { session }
    );
    expect(result).toEqual({ enrollment: fakeEnrollment });
  });

  it("rejects when maxStudents capacity is already reached (400)", async () => {
    const limitedCourse = makeCourse({ maxStudents: 5, enrollmentCount: 5 });
    Course.findOne.mockResolvedValue(limitedCourse);
    Enrollment.findOne.mockResolvedValue(null);
    Course.findOneAndUpdate.mockResolvedValue(null);

    await expect(enrollInCourse(USER_ID, "test-course")).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/maximum number of students/i),
    });

    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: COURSE_ID,
        $expr: { $lt: ["$enrollmentCount", "$maxStudents"] },
      },
      { $inc: { enrollmentCount: 1 } },
      { new: true, session }
    );
    expect(Enrollment.create).not.toHaveBeenCalled();
    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it("rejects when payment.user does not match the enrolling user (402)", async () => {
    const paidCourse = makeCourse({ pricing: { type: "paid", amount: 49 }, autoEnroll: false });
    Course.findOne.mockResolvedValue(paidCourse);
    Enrollment.findOne.mockResolvedValue(null);
    Payment.findOne.mockResolvedValue(null);

    await expect(enrollInCourse(USER_ID, "test-course", "sess_other_user")).rejects.toMatchObject({
      statusCode: 402,
      message: expect.stringMatching(/payment required/i),
    });

    expect(Payment.findOne).toHaveBeenCalledWith({
      stripeSessionId: "sess_other_user",
      status: "completed",
      course: COURSE_ID,
      user: USER_ID,
    });
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });
});

// ────── updateProgress ──────────────────────────────

describe("updateProgress", () => {
  it("adds lesson to completedLessons with an atomic update and recalculates percentComplete", async () => {
    const course = makeCourse();
    const initialEnrollment = makeEnrollmentDoc();
    const updatedEnrollment = makeEnrollmentDoc({
      progress: {
        completedLessons: ["lesson-1"],
        currentModule: 0,
        currentLesson: 0,
        percentComplete: 0,
        lastAccessedAt: null,
      },
    });
    Enrollment.findById
      .mockResolvedValueOnce(initialEnrollment)
      .mockResolvedValueOnce(updatedEnrollment);
    Enrollment.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

    const result = await updateProgress(
      USER_ID,
      "test-course",
      "lesson-1",
      true,
      { _id: initialEnrollment._id },
      course
    );

    expect(Enrollment.updateOne).toHaveBeenCalledWith(
      { _id: initialEnrollment._id },
      expect.objectContaining({
        $addToSet: { "progress.completedLessons": "lesson-1" },
        $set: { "progress.lastAccessedAt": expect.any(Date) },
      })
    );
    expect(updatedEnrollment.progress.percentComplete).toBe(33);
    expect(updatedEnrollment.save).toHaveBeenCalled();
    expect(result.enrollment).toBeDefined();
  });

  it("rejects progress updates on dropped or suspended enrollments (400)", async () => {
    Enrollment.findById.mockResolvedValue(
      makeEnrollmentDoc({
        status: "dropped",
      })
    );

    await expect(
      updateProgress(USER_ID, "test-course", "lesson-1", true, { _id: "enr001" }, makeCourse())
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/dropped or suspended enrollment/i),
    });

    expect(Enrollment.updateOne).not.toHaveBeenCalled();
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
