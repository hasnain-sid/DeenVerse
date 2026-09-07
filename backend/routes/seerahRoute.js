import { Router } from "express";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
  getSeerahSegment,
  getSeerahEvent,
} from "../controller/seerahController.js";

const router = Router();

/** 100 requests / 15 minutes per IP — public endpoint protection (mirrors signRoute.js) */
const publicSeerahLimiter = rateLimiter({
  points: 100,
  duration: 15 * 60,
  keyPrefix: "rl_seerah_public",
});

router.use(publicSeerahLimiter);

// Read-only and unauthenticated by design: the graph is reference content, and
// every edge carries its own review state for the client to badge honestly.
router.get("/segments/:segment", getSeerahSegment);
router.get("/events/:slug", getSeerahEvent);

export default router;
