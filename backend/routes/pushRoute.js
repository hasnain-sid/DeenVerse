import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getVapidKey,
  subscribePush,
  unsubscribePush,
} from "../controller/pushController.js";

const router = express.Router();

// Public — anyone can retrieve the VAPID public key
router.get("/vapid-key", getVapidKey);

// Protected — authenticated users only
router.post("/subscribe", isAuthenticated, subscribePush);
router.post("/unsubscribe", isAuthenticated, unsubscribePush);

export default router;
