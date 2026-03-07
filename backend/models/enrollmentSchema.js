import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "suspended"],
      default: "active",
    },
    progress: {
      completedLessons: [String],
      currentModule: { type: Number, default: 0 },
      currentLesson: { type: Number, default: 0 },
      percentComplete: { type: Number, default: 0 },
      lastAccessedAt: Date,
    },
    payment: {
      stripePaymentId: String,
      amount: Number,
      paidAt: Date,
    },
    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      certificateId: String,
    },
    notes: [
      {
        lessonId: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    enrolledAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

// Compound unique index — one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
