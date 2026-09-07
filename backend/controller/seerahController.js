import { getSegment, getEventBySlug } from "../services/seerahService.js";
import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

/** v1 has exactly one segment; seerahEventSchema's own enum says so too. */
const VALID_SEGMENTS = ["badr"];

/**
 * @desc   Get a whole Seerah segment — events in narrative order, each with its
 *         published edges and the hadith/tafsir those edges name.
 * @route  GET /api/v1/seerah/segments/:segment
 * @access Public
 */
export const getSeerahSegment = async (req, res, next) => {
  try {
    const { segment } = req.params;

    if (!VALID_SEGMENTS.includes(segment)) {
      return next(
        new AppError(
          `Unknown segment "${segment}". Valid segments: ${VALID_SEGMENTS.join(", ")}.`,
          400
        )
      );
    }

    const data = await getSegment(segment);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    logger.error("Error fetching seerah segment:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to fetch seerah segment.", 500)
    );
  }
};

/**
 * @desc   Get one event by slug, with its edges resolved.
 * @route  GET /api/v1/seerah/events/:slug
 * @access Public
 */
export const getSeerahEvent = async (req, res, next) => {
  try {
    const event = await getEventBySlug(req.params.slug);

    // An unpublished event 404s exactly like a missing one — the response must
    // not reveal that a draft exists behind the slug.
    if (!event) return next(new AppError("Event not found.", 404));

    return res.status(200).json({ success: true, event });
  } catch (error) {
    logger.error("Error fetching seerah event:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to fetch seerah event.", 500)
    );
  }
};
