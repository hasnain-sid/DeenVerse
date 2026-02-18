import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Exactly 2 participants for direct messages
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Quick reference to the last message (for sorting conversations)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of a user's conversations
conversationSchema.index({ participants: 1, updatedAt: -1 });

// Ensure each pair of participants can only have one conversation
conversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    partialFilterExpression: { "participants.1": { $exists: true } },
  }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
