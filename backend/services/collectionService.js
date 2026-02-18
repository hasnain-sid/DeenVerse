import { Collection } from "../models/collectionSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get all collections for a user
 */
export const getUserCollections = async (userId) => {
  const collections = await Collection.find({ owner: userId }).sort({ createdAt: -1 });
  return { success: true, collections, statusCode: 200 };
};

/**
 * Create a new collection
 */
export const createCollection = async (userId, data) => {
  const { name, description, emoji } = data;

  if (!name || !name.trim()) {
    throw new AppError("Collection name is required", 400);
  }

  // Check for duplicate name
  const existing = await Collection.findOne({ owner: userId, name: name.trim() });
  if (existing) {
    throw new AppError("You already have a collection with this name", 409);
  }

  const collection = await Collection.create({
    name: name.trim(),
    description: description?.trim() ?? "",
    emoji: emoji || "📖",
    owner: userId,
    hadithIds: [],
  });

  return { success: true, collection, statusCode: 201 };
};

/**
 * Update a collection (name, description, emoji)
 */
export const updateCollection = async (userId, collectionId, data) => {
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }

  if (collection.isDefault) {
    throw new AppError("Cannot modify the default collection", 400);
  }

  const allowedFields = ["name", "description", "emoji"];
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      collection[key] = typeof data[key] === "string" ? data[key].trim() : data[key];
    }
  }

  // Check name uniqueness if name changed
  if (data.name) {
    const duplicate = await Collection.findOne({
      owner: userId,
      name: data.name.trim(),
      _id: { $ne: collectionId },
    });
    if (duplicate) {
      throw new AppError("You already have a collection with this name", 409);
    }
  }

  await collection.save();
  return { success: true, collection, statusCode: 200 };
};

/**
 * Delete a collection
 */
export const deleteCollection = async (userId, collectionId) => {
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }
  if (collection.isDefault) {
    throw new AppError("Cannot delete the default collection", 400);
  }

  await Collection.deleteOne({ _id: collectionId });
  return { success: true, message: "Collection deleted", statusCode: 200 };
};

/**
 * Add a hadith to a collection
 */
export const addHadithToCollection = async (userId, collectionId, hadithId) => {
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }

  if (collection.hadithIds.includes(hadithId)) {
    return { success: true, collection, message: "Already in collection", statusCode: 200 };
  }

  collection.hadithIds.push(hadithId);
  await collection.save();
  return { success: true, collection, message: "Added to collection", statusCode: 200 };
};

/**
 * Remove a hadith from a collection
 */
export const removeHadithFromCollection = async (userId, collectionId, hadithId) => {
  const collection = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }

  collection.hadithIds = collection.hadithIds.filter((id) => id !== hadithId);
  await collection.save();
  return { success: true, collection, message: "Removed from collection", statusCode: 200 };
};
