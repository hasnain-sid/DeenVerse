import {
  getUserCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addHadithToCollection,
  removeHadithFromCollection,
} from "../services/collectionService.js";

export const getCollections = async (req, res, next) => {
  try {
    const result = await getUserCollections(req.user);
    return res.status(result.statusCode).json({
      collections: result.collections,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const createCollectionHandler = async (req, res, next) => {
  try {
    const result = await createCollection(req.user, req.body);
    return res.status(result.statusCode).json({
      collection: result.collection,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollectionHandler = async (req, res, next) => {
  try {
    const result = await updateCollection(req.user, req.params.id, req.body);
    return res.status(result.statusCode).json({
      collection: result.collection,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCollectionHandler = async (req, res, next) => {
  try {
    const result = await deleteCollection(req.user, req.params.id);
    return res.status(result.statusCode).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const addHadithHandler = async (req, res, next) => {
  try {
    const { hadithId } = req.body;
    if (!hadithId) {
      return res.status(400).json({ success: false, message: "hadithId is required" });
    }
    const result = await addHadithToCollection(req.user, req.params.id, String(hadithId));
    return res.status(result.statusCode).json({
      collection: result.collection,
      message: result.message,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const removeHadithHandler = async (req, res, next) => {
  try {
    const { hadithId } = req.params;
    if (!hadithId) {
      return res.status(400).json({ success: false, message: "hadithId is required" });
    }
    const result = await removeHadithFromCollection(req.user, req.params.id, String(hadithId));
    return res.status(result.statusCode).json({
      collection: result.collection,
      message: result.message,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
