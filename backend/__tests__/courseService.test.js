import {
  createCourse,
  browseCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  publishCourse,
  addModule,
  updateModule,
  deleteModule,
  getAdminCourses,
  reviewCourse,
} from "../services/courseService.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Mock dependencies ───────────────────────────────────

jest.mock("../models/courseSchema.js", () => ({
  Course: Object.assign(jest.fn(), {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
  }),
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: {
    exists: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn(), findByIdAndUpdate: jest.fn(), updateOne: jest.fn() },
}));

jest.mock("../models/paymentSchema.js", () => ({
  Payment: { findOne: jest.fn() },
}));

jest.mock("../config/redis.js", () => ({
  getRedisClient: jest.fn(),
  isRedisConnected: jest.fn().mockReturnValue(false),
}));

jest.mock("../services/notificationService.js", () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("slugify", () => ({
  __esModule: true,
  default: jest.fn((str, opts) => {
    // Simplified slugify for tests
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }),
}));

// ── Helpers ─────────────────────────────────────────────

const OWNER_ID = "owner123";
const OTHER_ID = "other456";
const ADMIN_ID = "admin789";

const baseCourseData = {
  title: "Introduction to Tajweed",
  description: "Tajweed rules for beginners",
  category: "tajweed",
  level: "beginner",
  type: "self-paced",
};

function makeCourseDoc(overrides = {}) {
  const doc = {
    _id: "c1",
    instructor: { toString: () => OWNER_ID },
    title: "Introduction to Tajweed",
    slug: "introduction-to-tajweed",
    description: "Tajweed rules for beginners",
    category: "tajweed",
    level: "beginner",
    type: "self-paced",
    status: "draft",
    pricing: { type: "free", amount: 0, currency: "usd" },
    modules: [],
    enrollmentCount: 0,
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

// Store original env
const originalEnv = { ...process.env };

// ─────────────────────────────────────────────────────────
// createCourse
// ─────────────────────────────────────────────────────────

describe("createCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a course with valid data and sets instructor", async () => {
    const savedDoc = makeCourseDoc();

    // Course constructor returns an instance with save()
    Course.mockImplementation((data) => ({
      ...data,
      _id: "c1",
      save: jest.fn().mockResolvedValue(undefined),
    }));

    const populatedCourse = { ...savedDoc, instructor: { _id: OWNER_ID, name: "Scholar" } };
    Course.findById.mockReturnValue(chainQuery(populatedCourse));

    const result = await createCourse(OWNER_ID, baseCourseData);

    expect(result.course).toBeDefined();
    expect(result.course.instructor._id).toBe(OWNER_ID);
    expect(Course.findById).toHaveBeenCalledWith("c1");
  });

  it("sets instructor from userId parameter", async () => {
    let capturedData;
    Course.mockImplementation((data) => {
      capturedData = data;
      return { ...data, _id: "c1", save: jest.fn().mockResolvedValue(undefined) };
    });

    Course.findById.mockReturnValue(chainQuery(makeCourseDoc()));

    await createCourse(OWNER_ID, baseCourseData);

    expect(capturedData.instructor).toBe(OWNER_ID);
  });
});

// ─────────────────────────────────────────────────────────
// browseCourses
// ─────────────────────────────────────────────────────────

describe("browseCourses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("filters by category, level, and type", async () => {
    const courseDocs = [makeCourseDoc({ status: "published" })];
    Course.find.mockReturnValue(chainQuery(courseDocs));
    Course.countDocuments.mockResolvedValue(1);

    const result = await browseCourses({
      category: "tajweed",
      level: "beginner",
      type: "self-paced",
    });

    const findCall = Course.find.mock.calls[0][0];
    expect(findCall.status).toBe("published");
    expect(findCall.category).toBe("tajweed");
    expect(findCall.level).toBe("beginner");
    expect(findCall.type).toBe("self-paced");

    expect(result.courses).toHaveLength(1);
  });

  it("applies text search filter", async () => {
    Course.find.mockReturnValue(chainQuery([]));
    Course.countDocuments.mockResolvedValue(0);

    await browseCourses({ search: "tajweed" });

    const findCall = Course.find.mock.calls[0][0];
    expect(findCall.$or).toBeDefined();
    expect(findCall.$or).toHaveLength(2);
  });

  it("returns correct pagination", async () => {
    Course.find.mockReturnValue(chainQuery([]));
    Course.countDocuments.mockResolvedValue(25);

    const result = await browseCourses({ page: 2, limit: 10 });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(25);
    expect(result.pagination.totalPages).toBe(3);
  });

  it("only returns published courses", async () => {
    Course.find.mockReturnValue(chainQuery([]));
    Course.countDocuments.mockResolvedValue(0);

    await browseCourses({});

    const findCall = Course.find.mock.calls[0][0];
    expect(findCall.status).toBe("published");
  });
});

// ─────────────────────────────────────────────────────────
// getCourseBySlug
// ─────────────────────────────────────────────────────────

describe("getCourseBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns course with instructor populated", async () => {
    const populatedCourse = makeCourseDoc({
      instructor: { _id: OWNER_ID, name: "Scholar", username: "scholar1" },
    });
    Course.findOne.mockReturnValue(chainQuery(populatedCourse));

    const result = await getCourseBySlug("introduction-to-tajweed", null);

    expect(result.course).toBeDefined();
    expect(result.course.instructor.name).toBe("Scholar");
    expect(Course.findOne).toHaveBeenCalledWith({ slug: "introduction-to-tajweed" });
  });

  it("includes isEnrolled=true for enrolled user", async () => {
    const populatedCourse = makeCourseDoc();
    Course.findOne.mockReturnValue(chainQuery(populatedCourse));
    Enrollment.exists.mockResolvedValue({ _id: "enr1" });

    const result = await getCourseBySlug("introduction-to-tajweed", "student1");

    expect(result.isEnrolled).toBe(true);
  });

  it("includes isEnrolled=false for non-enrolled user", async () => {
    const populatedCourse = makeCourseDoc();
    Course.findOne.mockReturnValue(chainQuery(populatedCourse));
    Enrollment.exists.mockResolvedValue(null);

    const result = await getCourseBySlug("introduction-to-tajweed", "student2");

    expect(result.isEnrolled).toBe(false);
  });

  it("returns isEnrolled=false when no userId provided", async () => {
    Course.findOne.mockReturnValue(chainQuery(makeCourseDoc()));

    const result = await getCourseBySlug("introduction-to-tajweed", null);

    expect(result.isEnrolled).toBe(false);
    expect(Enrollment.exists).not.toHaveBeenCalled();
  });

  it("throws 404 when course not found", async () => {
    Course.findOne.mockReturnValue(chainQuery(null));

    await expect(getCourseBySlug("nonexistent", null)).rejects.toThrow(AppError);
    await expect(getCourseBySlug("nonexistent", null)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─────────────────────────────────────────────────────────
// updateCourse
// ─────────────────────────────────────────────────────────

describe("updateCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("passes ownership check for course owner", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery({ ...courseDoc, description: "Updated" }));

    const result = await updateCourse(OWNER_ID, "introduction-to-tajweed", {
      description: "Updated",
    });

    expect(courseDoc.save).toHaveBeenCalled();
    expect(result.course).toBeDefined();
  });

  it("fails ownership check for non-owner (403)", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    User.findById.mockReturnValue(chainQuery({ _id: OTHER_ID, role: "user" }));

    await expect(
      updateCourse(OTHER_ID, "introduction-to-tajweed", { description: "Hacked" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("allows admin to update any course", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    const result = await updateCourse(ADMIN_ID, "introduction-to-tajweed", {
      description: "Admin fix",
    });

    expect(result.course).toBeDefined();
  });

  it("allows admin via DB role to update any course", async () => {
    // Not in ADMIN_IDS env var, but has admin role in DB
    const dbAdminId = "dbadmin999";
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    User.findById.mockReturnValue(chainQuery({ _id: dbAdminId, role: "admin" }));
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    const result = await updateCourse(dbAdminId, "introduction-to-tajweed", {
      description: "DB admin fix",
    });

    expect(result.course).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────
// deleteCourse
// ─────────────────────────────────────────────────────────

describe("deleteCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  it("soft-deletes (archives) when enrollments exist", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    Enrollment.exists.mockResolvedValue({ _id: "enr1" });

    const result = await deleteCourse(OWNER_ID, "introduction-to-tajweed");

    expect(courseDoc.status).toBe("archived");
    expect(courseDoc.save).toHaveBeenCalled();
    expect(result.message).toMatch(/archived/i);
    expect(Course.deleteOne).not.toHaveBeenCalled();
  });

  it("hard-deletes when no enrollments exist", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    Enrollment.exists.mockResolvedValue(null);
    Course.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteCourse(OWNER_ID, "introduction-to-tajweed");

    expect(Course.deleteOne).toHaveBeenCalledWith({ _id: "c1" });
    expect(result.message).toMatch(/deleted/i);
  });
});

// ─────────────────────────────────────────────────────────
// publishCourse
// ─────────────────────────────────────────────────────────

describe("publishCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  it("sets status to pending-review with valid content", async () => {
    const courseDoc = makeCourseDoc({
      status: "draft",
      modules: [
        { title: "Module 1", order: 0, lessons: [{ title: "L1", type: "video", order: 0 }] },
      ],
    });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery({ ...courseDoc, status: "pending-review" }));

    const result = await publishCourse(OWNER_ID, "introduction-to-tajweed");

    expect(courseDoc.status).toBe("pending-review");
    expect(courseDoc.save).toHaveBeenCalled();
  });

  it("rejects if already published (400)", async () => {
    const courseDoc = makeCourseDoc({ status: "published" });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      publishCourse(OWNER_ID, "introduction-to-tajweed")
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringMatching(/already published/i) });
  });

  it("rejects if already pending-review (400)", async () => {
    const courseDoc = makeCourseDoc({ status: "pending-review" });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      publishCourse(OWNER_ID, "introduction-to-tajweed")
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects if no modules", async () => {
    const courseDoc = makeCourseDoc({ status: "draft", modules: [] });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      publishCourse(OWNER_ID, "introduction-to-tajweed")
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringMatching(/module/i) });
  });

  it("rejects if modules exist but no lessons", async () => {
    const courseDoc = makeCourseDoc({
      status: "draft",
      modules: [{ title: "Empty Module", order: 0, lessons: [] }],
    });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      publishCourse(OWNER_ID, "introduction-to-tajweed")
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringMatching(/lesson/i) });
  });
});

// ─────────────────────────────────────────────────────────
// Module operations
// ─────────────────────────────────────────────────────────

describe("addModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  it("adds a module and sets order", async () => {
    const courseDoc = makeCourseDoc({ modules: [] });
    courseDoc.modules.push = jest.fn().mockImplementation((...items) => {
      Array.prototype.push.apply(courseDoc.modules, items);
    });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    const result = await addModule(OWNER_ID, "introduction-to-tajweed", {
      title: "New Module",
    });

    expect(courseDoc.modules.push).toHaveBeenCalled();
    expect(courseDoc.save).toHaveBeenCalled();
    expect(result.course).toBeDefined();
  });

  it("fails for non-owner", async () => {
    const courseDoc = makeCourseDoc();
    Course.findOne.mockResolvedValue(courseDoc);
    User.findById.mockReturnValue(chainQuery({ _id: OTHER_ID, role: "user" }));

    await expect(
      addModule(OTHER_ID, "introduction-to-tajweed", { title: "Hacked Module" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("updateModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  it("updates module title", async () => {
    const mod = { title: "Old Title", description: "", order: 0, lessons: [] };
    const courseDoc = makeCourseDoc({ modules: [mod] });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    const result = await updateModule(OWNER_ID, "introduction-to-tajweed", 0, {
      title: "New Title",
    });

    expect(courseDoc.modules[0].title).toBe("New Title");
    expect(courseDoc.save).toHaveBeenCalled();
  });

  it("throws 400 for invalid module index", async () => {
    const courseDoc = makeCourseDoc({ modules: [] });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      updateModule(OWNER_ID, "introduction-to-tajweed", 5, { title: "X" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("deleteModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_IDS = ADMIN_ID;
  });

  it("deletes module and re-orders remaining", async () => {
    const modules = [
      { title: "Module 0", order: 0, lessons: [] },
      { title: "Module 1", order: 1, lessons: [] },
      { title: "Module 2", order: 2, lessons: [] },
    ];
    const courseDoc = makeCourseDoc({ modules });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    await deleteModule(OWNER_ID, "introduction-to-tajweed", 1);

    expect(courseDoc.modules).toHaveLength(2);
    expect(courseDoc.modules[0].title).toBe("Module 0");
    expect(courseDoc.modules[1].title).toBe("Module 2");
    // Re-ordered
    expect(courseDoc.modules[0].order).toBe(0);
    expect(courseDoc.modules[1].order).toBe(1);
    expect(courseDoc.save).toHaveBeenCalled();
  });

  it("throws 400 for out-of-range index", async () => {
    const courseDoc = makeCourseDoc({ modules: [{ title: "M", order: 0, lessons: [] }] });
    Course.findOne.mockResolvedValue(courseDoc);

    await expect(
      deleteModule(OWNER_ID, "introduction-to-tajweed", 5)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("fails for non-owner", async () => {
    const courseDoc = makeCourseDoc({ modules: [{ title: "M", order: 0, lessons: [] }] });
    Course.findOne.mockResolvedValue(courseDoc);
    User.findById.mockReturnValue(chainQuery({ _id: OTHER_ID, role: "user" }));

    await expect(
      deleteModule(OTHER_ID, "introduction-to-tajweed", 0)
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ─────────────────────────────────────────────────────────
// getAdminCourses
// ─────────────────────────────────────────────────────────

describe("getAdminCourses", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns paginated courses filtered by status", async () => {
    const courses = [makeCourseDoc({ status: "pending-review" })];
    Course.find.mockReturnValue(chainQuery(courses));
    Course.countDocuments.mockResolvedValue(1);

    const result = await getAdminCourses("pending-review", 1, 10);

    expect(result.courses).toEqual(courses);
    expect(result.pagination).toMatchObject({ page: 1, total: 1, totalPages: 1 });
    expect(Course.find).toHaveBeenCalledWith({ status: "pending-review" });
  });

  it("skips status filter when status is 'all'", async () => {
    Course.find.mockReturnValue(chainQuery([]));
    Course.countDocuments.mockResolvedValue(0);

    await getAdminCourses("all", 1, 10);

    expect(Course.find).toHaveBeenCalledWith({});
  });

  it("defaults to 'pending-review' status when none provided", async () => {
    Course.find.mockReturnValue(chainQuery([]));
    Course.countDocuments.mockResolvedValue(0);

    await getAdminCourses();

    expect(Course.find).toHaveBeenCalledWith({ status: "pending-review" });
  });
});

// ─────────────────────────────────────────────────────────
// reviewCourse
// ─────────────────────────────────────────────────────────

describe("reviewCourse", () => {
  beforeEach(() => jest.clearAllMocks());

  it("approves a pending-review course → status becomes published", async () => {
    const courseDoc = makeCourseDoc({ status: "pending-review" });
    Course.findOne.mockResolvedValue(courseDoc);
    User.findByIdAndUpdate.mockResolvedValue(undefined);
    Course.findById.mockReturnValue(chainQuery({ ...courseDoc, status: "published" }));

    const result = await reviewCourse(ADMIN_ID, "introduction-to-tajweed", "approved");

    expect(courseDoc.status).toBe("published");
    expect(courseDoc.reviewedBy).toBe(ADMIN_ID);
    expect(courseDoc.save).toHaveBeenCalled();
  });

  it("rejects a pending-review course → status returns to draft", async () => {
    const courseDoc = makeCourseDoc({ status: "pending-review" });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery({ ...courseDoc, status: "draft" }));

    await reviewCourse(ADMIN_ID, "introduction-to-tajweed", "rejected", "Needs more content");

    expect(courseDoc.status).toBe("draft");
    expect(courseDoc.rejectionReason).toBe("Needs more content");
  });

  it("uses a default rejection reason when none provided", async () => {
    const courseDoc = makeCourseDoc({ status: "pending-review" });
    Course.findOne.mockResolvedValue(courseDoc);
    Course.findById.mockReturnValue(chainQuery(courseDoc));

    await reviewCourse(ADMIN_ID, "introduction-to-tajweed", "rejected");

    expect(courseDoc.rejectionReason).toMatch(/did not meet/i);
  });

  it("throws 400 when course is not in pending-review status", async () => {
    Course.findOne.mockResolvedValue(makeCourseDoc({ status: "draft" }));

    await expect(
      reviewCourse(ADMIN_ID, "introduction-to-tajweed", "approved"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 for an invalid decision value", async () => {
    Course.findOne.mockResolvedValue(makeCourseDoc({ status: "pending-review" }));

    await expect(
      reviewCourse(ADMIN_ID, "introduction-to-tajweed", "maybe"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 404 when course not found", async () => {
    Course.findOne.mockResolvedValue(null);

    await expect(
      reviewCourse(ADMIN_ID, "nonexistent", "approved"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
