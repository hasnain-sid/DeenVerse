import express from "express";
import {
    getAyahByNumber,
    getRukuByNumber,
    getJuzByNumber,
} from "../controller/quranController.js";

const router = express.Router();

// GET /api/v1/quran/ayah/:number → single ayah (1–6236)
router.get("/ayah/:number", getAyahByNumber);

// GET /api/v1/quran/ruku/:number → full ruku (1–556)
router.get("/ruku/:number", getRukuByNumber);

// GET /api/v1/quran/juz/:number → full juzz (1–30)
router.get("/juz/:number", getJuzByNumber);

export default router;
