import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * Enrollment middleware — checks if the authenticated user is enrolled in the course.
 * Requires `isAuthenticated` to run first (so req.user is set).
 *
 * Behaviour:
 *  1. Looks up the course by slug from req.params.slug
 *  2. Checks for an active enrollment for req.user + course
 *  3. If enrolled: attaches enrollment to req.enrollment, calls next()
 *  4. If not enrolled but the requested lesson is a free preview (isFree), allows through
 *  5. Otherwise: 403 error
 */
export const isEnrolled = async (req, _res, next) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // Attach course for downstream handlers
    req.course = course;

    const enrollment = await Enrollment.findOne({
      student: req.user,
      course: course._id,
      status: "active",
    }).lean();

    if (enrollment) {
      req.enrollment = enrollment;
      return next();
    }

    // Check if the requested lesson is a free preview
    const { lessonId } = req.params;
    if (lessonId) {
      for (const mod of course.modules || []) {
        const lesson = (mod.lessons || []).find(
          (l) => l._id?.toString() === lessonId
        );
        if (lesson?.isFree) {
          return next();
        }
      }
    }

    return next(
      new AppError("You must be enrolled in this course", 403)
    );
  } catch (err) {
    next(err);
  }
};
