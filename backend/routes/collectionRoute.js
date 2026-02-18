import express from "express";
import isAuthenticated from "../config/auth.js";
import {
  getCollections,
  createCollectionHandler,
  updateCollectionHandler,
  deleteCollectionHandler,
  addHadithHandler,
  removeHadithHandler,
} from "../controller/collectionController.js";

const router = express.Router();

// All collection routes require authentication
router.use(isAuthenticated);

// CRUD
router.route("/").get(getCollections).post(createCollectionHandler);
router.route("/:id").put(updateCollectionHandler).delete(deleteCollectionHandler);

// Manage hadith items within a collection
router.route("/:id/hadiths").post(addHadithHandler);
router.route("/:id/hadiths/:hadithId").delete(removeHadithHandler);

export default router;
