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
    const result = await createCourse(req.user, req.body);
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
    const result = await updateCourse(req.user, slug, req.body);
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
    const result = await addModule(req.user, slug, req.body);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateModuleHandler = async (req, res, next) => {
  try {
    const { slug, moduleIndex } = req.params;
    const result = await updateModule(req.user, slug, moduleIndex, req.body);
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
    const { paymentSessionId } = req.body;
    const result = await enrollInCourse(req.user, slug, paymentSessionId);
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
    const { lessonId, completed } = req.body;
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
    const { decision, reason } = req.body;
    const result = await reviewCourse(req.user, slug, decision, reason);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};
