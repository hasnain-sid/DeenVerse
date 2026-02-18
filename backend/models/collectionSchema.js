import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hadithIds: [
      {
        type: String, // Hadith IDs from the HadeethEnc external API are strings
      },
    ],
    emoji: {
      type: String,
      default: "📖",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A user can't have two collections with the same name
collectionSchema.index({ owner: 1, name: 1 }, { unique: true });
collectionSchema.index({ owner: 1, createdAt: -1 });

export const Collection = mongoose.model("Collection", collectionSchema);
