import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        answer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],
    score: Number,
    passed: Boolean,
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    attempt: { type: Number, required: true },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, passed: 1 });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
