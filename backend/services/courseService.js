import slugify from "slugify";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";
import { getRedisClient, isRedisConnected } from "../config/redis.js";
import { createAndEmitNotification } from "./notificationService.js";
import logger from "../config/logger.js";

// ── Helpers ──────────────────────────────────────────

/**
 * Verify the user owns the course (or is admin).
 * Returns the course document.
 */
async function verifyCourseOwnership(userId, slug) {
  const course = await Course.findOne({ slug });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const adminIds = (process.env.ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isOwner = course.instructor.toString() === userId.toString();
  const isAdmin = adminIds.includes(userId.toString());

  if (!isOwner) {
    // Check DB for admin role
    if (!isAdmin) {
      const user = await User.findById(userId).select("role").lean();
      if (!user || user.role !== "admin") {
        throw new AppError("You don't have permission to modify this course", 403);
      }
    }
  }

  return course;
}

// ── Course CRUD ──────────────────────────────────────

/**
 * Create a new course.
 */
export async function createCourse(userId, data) {
  const course = new Course({
    ...data,
    instructor: userId,
  });

  await course.save(); // pre-save hook auto-generates slug

  const populated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: populated };
}

/**
 * Browse published courses with filtering, searching, sorting, and pagination.
 */
export async function browseCourses(filters) {
  const {
    category,
    level,
    type,
    search,
    sort = "newest",
    page = 1,
    limit = 12,
  } = filters;

  const query = { status: "published" };

  if (category) query.category = category;
  if (level) query.level = level;
  if (type) query.type = type;

  if (search) {
    const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: sanitized, $options: "i" } },
      { description: { $regex: sanitized, $options: "i" } },
    ];
  }

  // Sort options
  const sortMap = {
    popular: { enrollmentCount: -1 },
    newest: { createdAt: -1 },
    rating: { "rating.average": -1 },
    "price-low": { "pricing.amount": 1 },
    "price-high": { "pricing.amount": -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate("instructor", "name username avatar scholarProfile")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single course by slug. If userId is provided, include enrollment status.
 */
export async function getCourseBySlug(slug, userId) {
  const course = await Course.findOne({ slug })
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  let isEnrolled = false;
  if (userId) {
    const enrollment = await Enrollment.exists({
      student: userId,
      course: course._id,
      status: "active",
    });
    isEnrolled = !!enrollment;
  }

  return { course, isEnrolled };
}

/**
 * Get top 8 featured published courses, cached in Redis for 1 hour.
 */
export async function getFeaturedCourses() {
  const cacheKey = "courses:featured";

  // Try cache first
  if (isRedisConnected()) {
    try {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return { courses: JSON.parse(cached) };
      }
    } catch (err) {
      logger.warn("Redis cache read failed for featured courses", { error: err.message });
    }
  }

  // Aggregate a weighted score: enrollmentCount * 0.7 + rating.average * 0.3
  const courses = await Course.aggregate([
    { $match: { status: "published" } },
    {
      $addFields: {
        featuredScore: {
          $add: [
            { $multiply: ["$enrollmentCount", 0.7] },
            { $multiply: ["$rating.average", 0.3] },
          ],
        },
      },
    },
    { $sort: { featuredScore: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: "users",
        localField: "instructor",
        foreignField: "_id",
        as: "instructor",
        pipeline: [
          { $project: { name: 1, username: 1, avatar: 1, scholarProfile: 1 } },
        ],
      },
    },
    { $unwind: "$instructor" },
    { $project: { featuredScore: 0 } },
  ]);

  // Cache for 1 hour
  if (isRedisConnected()) {
    try {
      await getRedisClient().setex(cacheKey, 3600, JSON.stringify(courses));
    } catch (err) {
      logger.warn("Redis cache write failed for featured courses", { error: err.message });
    }
  }

  return { courses };
}

/**
 * Get courses the authenticated user is enrolled in.
 */
export async function getMyCourses(userId, status, page = 1, limit = 10) {
  const query = { student: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(query)
      .populate({
        path: "course",
        populate: { path: "instructor", select: "name username avatar" },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(query),
  ]);

  return {
    enrollments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get courses the scholar is teaching.
 */
export async function getMyTeaching(userId, status, page = 1, limit = 10) {
  const query = { instructor: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a course. Ownership verified. Cannot change pricing.type on published courses.
 */
export async function updateCourse(userId, slug, data) {
  const course = await verifyCourseOwnership(userId, slug);

  // Prevent changing pricing type on published courses
  if (
    course.status === "published" &&
    data.pricing?.type &&
    data.pricing.type !== course.pricing.type
  ) {
    throw new AppError("Cannot change pricing type on a published course", 400);
  }

  // If title changed, regenerate slug
  if (data.title && data.title !== course.title) {
    let baseSlug = slugify(data.title, { lower: true, strict: true });
    let newSlug = baseSlug;
    let counter = 1;
    while (
      await Course.exists({ slug: newSlug, _id: { $ne: course._id } })
    ) {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    data.slug = newSlug;
  }

  Object.assign(course, data);
  await course.save();

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}

/**
 * Delete a course. Soft-delete (archive) if enrollments exist, hard-delete otherwise.
 */
export async function deleteCourse(userId, slug) {
  const course = await verifyCourseOwnership(userId, slug);

  const hasEnrollments = await Enrollment.exists({ course: course._id });

  if (hasEnrollments) {
    course.status = "archived";
    await course.save();
    return { message: "Course archived (has existing enrollments)" };
  }

  await Course.deleteOne({ _id: course._id });
  return { message: "Course deleted" };
}

/**
 * Submit a course for review. Requires at least 1 module with 1 lesson.
 */
export async function publishCourse(userId, slug) {
  const course = await verifyCourseOwnership(userId, slug);

  if (course.status === "published") {
    throw new AppError("Course is already published", 400);
  }

  if (course.status === "pending-review") {
    throw new AppError("Course is already pending review", 400);
  }

  // Validate course has content
  if (!course.modules || course.modules.length === 0) {
    throw new AppError("Course must have at least one module before publishing", 400);
  }

  const hasLesson = course.modules.some(
    (m) => m.lessons && m.lessons.length > 0
  );
  if (!hasLesson) {
    throw new AppError("Course must have at least one lesson before publishing", 400);
  }

  course.status = "pending-review";
  await course.save();

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}

// ── Module Management ────────────────────────────────

/**
 * Add a module to a course.
 */
export async function addModule(userId, slug, moduleData) {
  const course = await verifyCourseOwnership(userId, slug);

  moduleData.order = course.modules.length;
  course.modules.push(moduleData);
  await course.save();

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}

/**
 * Update a specific module in a course.
 */
export async function updateModule(userId, slug, moduleIndex, data) {
  const course = await verifyCourseOwnership(userId, slug);

  const idx = parseInt(moduleIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= course.modules.length) {
    throw new AppError("Module index out of range", 400);
  }

  const mod = course.modules[idx];
  if (data.title !== undefined) mod.title = data.title;
  if (data.description !== undefined) mod.description = data.description;
  if (data.order !== undefined) mod.order = data.order;
  if (data.lessons !== undefined) mod.lessons = data.lessons;

  await course.save();

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}

/**
 * Delete a module from a course and re-order remaining modules.
 */
export async function deleteModule(userId, slug, moduleIndex) {
  const course = await verifyCourseOwnership(userId, slug);

  const idx = parseInt(moduleIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= course.modules.length) {
    throw new AppError("Module index out of range", 400);
  }

  course.modules.splice(idx, 1);

  // Re-order remaining modules
  course.modules.forEach((mod, i) => {
    mod.order = i;
  });

  await course.save();

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}

// ── Enrollment & Progress ────────────────────────────

/**
 * Enroll a user in a course. Handles free and paid enrollment.
 */
export async function enrollInCourse(userId, slug, paymentSessionId) {
  const course = await Course.findOne({ slug, status: "published" });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({
    student: userId,
    course: course._id,
    status: { $in: ["active", "completed"] },
  });
  if (existing) {
    throw new AppError("Already enrolled in this course", 400);
  }

  // Check max students limit (0 = unlimited)
  if (course.maxStudents > 0 && course.enrollmentCount >= course.maxStudents) {
    throw new AppError("This course has reached its maximum number of students", 400);
  }

  const enrollmentData = {
    student: userId,
    course: course._id,
    status: "active",
  };

  // Handle paid courses
  if (course.pricing.type === "paid" && !course.autoEnroll) {
    if (!paymentSessionId) {
      throw new AppError("Payment required", 402);
    }

    const payment = await Payment.findOne({
      stripeSessionId: paymentSessionId,
      status: "completed",
      course: course._id,
    });
    if (!payment) {
      throw new AppError("Payment required", 402);
    }

    enrollmentData.payment = {
      stripePaymentId: payment.stripePaymentIntentId || paymentSessionId,
      amount: payment.amount,
      paidAt: new Date(),
    };
  }

  const enrollment = await Enrollment.create(enrollmentData);

  // Increment course enrollment count
  await Course.updateOne({ _id: course._id }, { $inc: { enrollmentCount: 1 } });

  // Increment instructor's totalStudents
  await User.updateOne(
    { _id: course.instructor },
    { $inc: { "scholarProfile.totalStudents": 1 } }
  );

  return { enrollment };
}

/**
 * Get course progress from the enrollment attached by middleware.
 */
export function getCourseProgress(enrollment) {
  return {
    enrollment: {
      _id: enrollment._id,
      status: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    },
  };
}

/**
 * Update lesson progress: mark a lesson as completed, recalculate percentComplete.
 */
export async function updateProgress(userId, slug, lessonId, completed, enrollment, course) {
  if (!lessonId) {
    throw new AppError("lessonId is required", 400);
  }

  // Use the enrollment doc attached by middleware (lean), re-fetch as a mutable doc
  const enrollmentDoc = await Enrollment.findById(enrollment._id);
  if (!enrollmentDoc) {
    throw new AppError("Enrollment not found", 404);
  }

  // Fetch full course if not already available
  const courseDoc = course || await Course.findOne({ slug }).lean();
  if (!courseDoc) {
    throw new AppError("Course not found", 404);
  }

  if (completed) {
    // Add lessonId if not already present
    if (!enrollmentDoc.progress.completedLessons.includes(lessonId)) {
      enrollmentDoc.progress.completedLessons.push(lessonId);
    }
  } else {
    // Allow un-completing a lesson
    enrollmentDoc.progress.completedLessons =
      enrollmentDoc.progress.completedLessons.filter((id) => id !== lessonId);
  }

  // Count total lessons across all modules
  let totalLessons = 0;
  for (const mod of courseDoc.modules || []) {
    totalLessons += (mod.lessons || []).length;
  }

  // Recalculate percent complete
  enrollmentDoc.progress.percentComplete =
    totalLessons > 0
      ? Math.round(
          (enrollmentDoc.progress.completedLessons.length / totalLessons) * 100
        )
      : 0;

  enrollmentDoc.progress.lastAccessedAt = new Date();

  // Auto-complete if 100%
  if (enrollmentDoc.progress.percentComplete === 100 && enrollmentDoc.status !== "completed") {
    enrollmentDoc.status = "completed";
    enrollmentDoc.completedAt = new Date();
  } else if (enrollmentDoc.progress.percentComplete < 100 && enrollmentDoc.status === "completed") {
    // Re-activate if un-completing brought it below 100
    enrollmentDoc.status = "active";
    enrollmentDoc.completedAt = undefined;
  }

  await enrollmentDoc.save();

  return { enrollment: enrollmentDoc.toObject() };
}

/**
 * Get lesson content. Free preview lessons are accessible without enrollment.
 */
export async function getLessonContent(userId, slug, lessonId) {
  const course = await Course.findOne({ slug }).lean();
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Find the lesson across all modules
  let targetLesson = null;
  let targetModuleIndex = -1;
  let targetLessonIndex = -1;

  for (let mi = 0; mi < (course.modules || []).length; mi++) {
    const mod = course.modules[mi];
    for (let li = 0; li < (mod.lessons || []).length; li++) {
      const lesson = mod.lessons[li];
      if (lesson._id?.toString() === lessonId) {
        targetLesson = lesson;
        targetModuleIndex = mi;
        targetLessonIndex = li;
        break;
      }
    }
    if (targetLesson) break;
  }

  if (!targetLesson) {
    throw new AppError("Lesson not found", 404);
  }

  // Check access: free preview or enrolled
  if (!targetLesson.isFree) {
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: course._id,
      status: "active",
    });
    if (!enrollment) {
      throw new AppError("You must be enrolled in this course to access this lesson", 403);
    }
  }

  // Build navigation info
  const allLessons = [];
  for (const mod of course.modules || []) {
    for (const lesson of mod.lessons || []) {
      allLessons.push(lesson);
    }
  }

  const flatIndex = allLessons.findIndex(
    (l) => l._id?.toString() === lessonId
  );
  const prevLesson = flatIndex > 0 ? allLessons[flatIndex - 1] : null;
  const nextLesson =
    flatIndex < allLessons.length - 1 ? allLessons[flatIndex + 1] : null;

  return {
    lesson: targetLesson,
    moduleIndex: targetModuleIndex,
    lessonIndex: targetLessonIndex,
    prevLesson: prevLesson
      ? { _id: prevLesson._id, title: prevLesson.title, type: prevLesson.type }
      : null,
    nextLesson: nextLesson
      ? { _id: nextLesson._id, title: nextLesson.title, type: nextLesson.type }
      : null,
  };
}

// ── Admin ────────────────────────────────────────────

/**
 * List courses for admin review, filtered by status.
 */
export async function getAdminCourses(status = "pending-review", page = 1, limit = 10) {
  const query = {};
  if (status && status !== "all") {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate("instructor", "name username avatar scholarProfile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Approve or reject a course that is pending review.
 */
export async function reviewCourse(adminId, slug, decision, reason) {
  const course = await Course.findOne({ slug });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== "pending-review") {
    throw new AppError("Course is not pending review", 400);
  }

  if (decision === "approved") {
    course.status = "published";
    course.reviewedBy = adminId;
    course.reviewedAt = new Date();
    course.rejectionReason = undefined;
    await course.save();

    // Increment instructor's totalCourses
    await User.findByIdAndUpdate(course.instructor, {
      $inc: { "scholarProfile.totalCourses": 1 },
    });

    logger.info(`Course "${course.title}" approved by admin ${adminId}`);
  } else if (decision === "rejected") {
    course.status = "draft";
    course.reviewedBy = adminId;
    course.reviewedAt = new Date();
    course.rejectionReason = reason || "Course did not meet review criteria";
    await course.save();

    logger.info(`Course "${course.title}" rejected by admin ${adminId}`);
  } else {
    throw new AppError("Invalid decision. Must be 'approved' or 'rejected'", 400);
  }

  // Notify the instructor
  try {
    await createAndEmitNotification({
      recipientId: course.instructor,
      senderId: adminId,
      type: "system",
    });
  } catch (err) {
    logger.warn(`Failed to send course review notification to instructor ${course.instructor}`, {
      error: err.message,
    });
  }

  const updated = await Course.findById(course._id)
    .populate("instructor", "name username avatar scholarProfile")
    .lean();

  return { course: updated };
}
