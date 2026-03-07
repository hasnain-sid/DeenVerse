import { isEnrolled } from "../middlewares/courseAccess.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/courseSchema.js", () => ({
  Course: { findOne: jest.fn() },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: { findOne: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────

function mockReq(overrides = {}) {
  return {
    params: { slug: "intro-to-tajweed" },
    user: "user123",
    ...overrides,
  };
}

function mockRes() {
  return {};
}

const courseDoc = {
  _id: "course1",
  slug: "intro-to-tajweed",
  modules: [
    {
      lessons: [
        { _id: { toString: () => "lesson1" }, title: "Lesson 1", isFree: false },
        { _id: { toString: () => "lesson2" }, title: "Free Preview", isFree: true },
      ],
    },
  ],
};

// Chainable query mock for Course.findOne
function chainQuery(resolvedValue) {
  const chain = {};
  chain.lean = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
}

// ── Tests ───────────────────────────────────────────────

describe("isEnrolled middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows enrolled student through", async () => {
    Course.findOne.mockReturnValue(chainQuery(courseDoc));
    Enrollment.findOne.mockReturnValue(
      chainQuery({ _id: "enr1", student: "user123", course: "course1", status: "active" })
    );

    const req = mockReq();
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(); // called with no error
    expect(req.course).toEqual(courseDoc);
    expect(req.enrollment).toBeDefined();
  });

  it("blocks non-enrolled user with 403", async () => {
    Course.findOne.mockReturnValue(chainQuery(courseDoc));
    Enrollment.findOne.mockReturnValue(chainQuery(null));

    const req = mockReq(); // no lessonId param
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/enrolled/i);
  });

  it("allows access to a free preview lesson without enrollment", async () => {
    Course.findOne.mockReturnValue(chainQuery(courseDoc));
    Enrollment.findOne.mockReturnValue(chainQuery(null));

    const req = mockReq({ params: { slug: "intro-to-tajweed", lessonId: "lesson2" } });
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(); // no error
  });

  it("blocks access to a non-free lesson without enrollment", async () => {
    Course.findOne.mockReturnValue(chainQuery(courseDoc));
    Enrollment.findOne.mockReturnValue(chainQuery(null));

    const req = mockReq({ params: { slug: "intro-to-tajweed", lessonId: "lesson1" } });
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  it("returns 404 when course not found", async () => {
    Course.findOne.mockReturnValue(chainQuery(null));

    const req = mockReq();
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.message).toMatch(/not found/i);
  });

  it("passes unexpected errors to next", async () => {
    const dbError = new Error("DB connection failed");
    Course.findOne.mockImplementation(() => {
      throw dbError;
    });

    const req = mockReq();
    const next = jest.fn();

    await isEnrolled(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
