import express from "express";
import isAuthenticated from "../config/auth.js";
import { presignHandler, confirmHandler } from "../controller/uploadController.js";

const router = express.Router();

// POST /api/v1/upload/presign — get a presigned S3 URL for direct upload
router.post("/presign", isAuthenticated, presignHandler);

// POST /api/v1/upload/confirm — verify the file landed in S3
router.post("/confirm", isAuthenticated, confirmHandler);

export default router;
