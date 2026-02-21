import express from 'express';
import isAuthenticated from '../config/auth.js';
import { getDailyAyah, saveReflection, getUserReflections } from '../controller/dailyAyahController.js';

const router = express.Router();

// Get the daily ayah (can integrate with external API or simple DB seed)
router.get('/today', getDailyAyah);

// Save a new reflection
router.post('/reflect', isAuthenticated, saveReflection);

// Get past reflections for the user
router.get('/reflections', isAuthenticated, getUserReflections);

export default router;
