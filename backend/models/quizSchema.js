import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: String,
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["quiz", "exam", "certification-exam"],
      default: "quiz",
    },
    timeLimit: { type: Number, default: 0 },
    passingScore: { type: Number, required: true },
    maxAttempts: { type: Number, default: 3 },
    questions: [
      {
        text: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "mcq",
            "true-false",
            "short-answer",
            "essay",
            "quran-recitation",
          ],
          required: true,
        },
        options: [{ text: String, isCorrect: Boolean }],
        points: { type: Number, default: 1 },
        explanation: String,
        ayahRef: String,
      },
    ],
    shuffleQuestions: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1 });
quizSchema.index({ course: 1, lesson: 1 });

export const Quiz = mongoose.model("Quiz", quizSchema);
