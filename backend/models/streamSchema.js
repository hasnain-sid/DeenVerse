import mongoose from "mongoose";

const streamSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    category: {
      type: String,
      enum: ["lecture", "quran_recitation", "qa_session", "discussion", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
      index: true,
    },
    // Stream key for broadcasting (e.g. RTMP ingest key from AWS IVS)
    streamKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    // HLS playback URL for viewers
    playbackUrl: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    viewerCount: {
      type: Number,
      default: 0,
    },
    peakViewers: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    chatEnabled: {
      type: Boolean,
      default: true,
    },
    // VOD recording URL (populated after stream ends)
    recordingUrl: {
      type: String,
      default: "",
    },
    // For scheduled streams
    scheduledFor: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for listing live streams
streamSchema.index({ status: 1, createdAt: -1 });
// Index for scheduled streams
streamSchema.index({ status: 1, scheduledFor: 1 });

export const Stream = mongoose.model("Stream", streamSchema);
