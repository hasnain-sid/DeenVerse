import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },

    // Link to course system (optional — standalone classrooms allowed)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    lessonId: String,

    // Type of classroom
    type: {
      type: String,
      enum: ["lecture", "halaqa", "quran-session", "qa-session", "workshop", "open"],
      default: "lecture",
    },

    // Scheduling
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    timezone: {
      type: String,
      default: "UTC",
    },

    // LiveKit
    livekitRoomName: {
      type: String,
      unique: true,
      sparse: true,
    },
    livekitRoomSid: String,

    // Status
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
    startedAt: Date,
    endedAt: Date,

    // Participants
    maxParticipants: {
      type: Number,
      default: 50,
      min: 2,
      max: 500,
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    peakParticipants: {
      type: Number,
      default: 0,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Settings
    settings: {
      chatEnabled: { type: Boolean, default: true },
      handRaiseEnabled: { type: Boolean, default: true },
      participantVideo: { type: Boolean, default: false },
      participantAudio: { type: Boolean, default: false },
      whiteboardEnabled: { type: Boolean, default: true },
      recordingEnabled: { type: Boolean, default: false },
      autoAdmit: { type: Boolean, default: true },
    },

    // Access control
    access: {
      type: String,
      enum: ["course-only", "followers", "public"],
      default: "course-only",
    },

    // Recordings
    activeEgressId: String, // Set while a recording is in progress
    recordings: [
      {
        egressId: String,
        url: String,
        duration: Number,
        size: Number,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Whiteboard — last tldraw state for reconnection
    whiteboardSnapshot: mongoose.Schema.Types.Mixed,

    // Metadata
    tags: [String],
    thumbnail: String,
    recurringId: String,
  },
  { timestamps: true }
);

// Indexes
classroomSchema.index({ host: 1 });
classroomSchema.index({ course: 1 });
classroomSchema.index({ status: 1, scheduledAt: 1 });

export const Classroom = mongoose.model("Classroom", classroomSchema);
