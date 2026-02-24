import { Router } from "express";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
  getDailySign,
  getSigns,
  getSignById,
  getCategories,
} from "../controller/signController.js";

const router = Router();

/** 100 requests / 15 minutes per IP — public endpoint protection */
const publicSignsLimiter = rateLimiter({
  points: 100,
  duration: 15 * 60,
  keyPrefix: "rl_signs_public",
});

router.use(publicSignsLimiter);

// Order matters: more specific paths before /:id
router.get("/daily",      getDailySign);
router.get("/categories", getCategories);
router.get("/:id",        getSignById);
router.get("/",           getSigns);

export default router;
