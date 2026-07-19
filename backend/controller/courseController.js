import {
  createCourseSchema,
  updateCourseSchema,
  courseModuleSchema,
  enrollCourseSchema,
  updateProgressSchema,
  courseReviewSchema,
} from "@deenverse/shared";
import { AppError } from "../utils/AppError.js";
import {
  createCourse,
  browseCourses,
  getCourseBySlug,
  getFeaturedCourses,
  getMyCourses,
  getMyTeaching,
  updateCourse,
  deleteCourse,
  publishCourse,
  addModule,
  updateModule,
  deleteModule,
  enrollInCourse,
  getCourseProgress,
  updateProgress,
  getLessonContent,
  getAdminCourses,
  reviewCourse,
} from "../services/courseService.js";

// ── Course CRUD ──────────────────────────────────────

export const createCourseHandler = async (req, res, next) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await createCourse(req.user, parsed.data);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const browseCoursesHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filters = {
      category: req.query.category,
      level: req.query.level,
      type: req.query.type,
      search: req.query.search,
      sort: req.query.sort,
      page,
      limit,
    };

    const result = await browseCourses(filters);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCoursesHandler = async (_req, res, next) => {
  try {
    const result = await getFeaturedCourses();
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getMyCoursesHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const status = req.query.status || undefined;

    const result = await getMyCourses(req.user, status, page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getMyTeachingHandler = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const status = req.query.status || undefined;

    const result = await getMyTeaching(req.user, status, page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlugHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    // req.user may be undefined for public access
    const userId = req.user || null;
    const result = await getCourseBySlug(slug, userId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateCourseHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await updateCourse(req.user, slug, parsed.data);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await deleteCourse(req.user, slug);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const publishCourseHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await publishCourse(req.user, slug);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Module Management ────────────────────────────────

export const addModuleHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = courseModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await addModule(req.user, slug, parsed.data);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateModuleHandler = async (req, res, next) => {
  try {
    const { slug, moduleIndex } = req.params;
    const parsed = courseModuleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await updateModule(req.user, slug, moduleIndex, parsed.data);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteModuleHandler = async (req, res, next) => {
  try {
    const { slug, moduleIndex } = req.params;
    const result = await deleteModule(req.user, slug, moduleIndex);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Enrollment & Progress ────────────────────────────

export const enrollInCourseHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = enrollCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await enrollInCourse(req.user, slug, parsed.data.paymentSessionId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getCourseProgressHandler = async (req, res, next) => {
  try {
    const result = getCourseProgress(req.enrollment);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateProgressHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = updateProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { lessonId, completed } = parsed.data;
    const result = await updateProgress(req.user, slug, lessonId, completed, req.enrollment, req.course);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getLessonContentHandler = async (req, res, next) => {
  try {
    const { slug, lessonId } = req.params;
    const result = await getLessonContent(req.user, slug, lessonId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Admin ────────────────────────────────────────────

export const getAdminCoursesHandler = async (req, res, next) => {
  try {
    const status = req.query.status || "pending-review";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const result = await getAdminCourses(status, page, limit);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const reviewCourseHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = courseReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { decision, reason } = parsed.data;
    const result = await reviewCourse(req.user, slug, decision, reason);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};
