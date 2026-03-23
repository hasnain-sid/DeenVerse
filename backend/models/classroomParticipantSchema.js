import mongoose from "mongoose";

const classroomParticipantSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["host", "co-host", "participant", "observer"],
      default: "participant",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: Date,
    duration: Number, // seconds spent in classroom
    handRaised: {
      type: Boolean,
      default: false,
    },
    handRaisedAt: Date,
    isMuted: {
      type: Boolean,
      default: true,
    },
    isVideoOn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique — one record per user per classroom
classroomParticipantSchema.index({ classroom: 1, user: 1 }, { unique: true });
// Fast lookup by role within a classroom
classroomParticipantSchema.index({ classroom: 1, role: 1 });

export const ClassroomParticipant = mongoose.model(
  "ClassroomParticipant",
  classroomParticipantSchema
);
