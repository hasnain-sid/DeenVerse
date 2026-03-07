import mongoose from "mongoose";
import { Quiz } from "../models/quizSchema.js";
import { QuizAttempt } from "../models/quizAttemptSchema.js";
import { Course } from "../models/courseSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

// ── Helpers ──────────────────────────────────────────

const ADMIN_IDS_CACHE = null;

function getAdminIds() {
  return (process.env.ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function isUserAdmin(userId) {
  const adminIds = getAdminIds();
  if (adminIds.includes(userId.toString())) return true;

  const user = await User.findById(userId).select("role").lean();
  return user?.role === "admin";
}

/**
 * Verify the user owns the course linked to a quiz (or is admin).
 */
async function verifyCourseOwnershipForQuiz(userId, courseId) {
  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner = course.instructor.toString() === userId.toString();
  if (!isOwner && !(await isUserAdmin(userId))) {
    throw new AppError("You don't have permission to manage this quiz", 403);
  }

  return course;
}

// ── Scholar Quiz CRUD ────────────────────────────────

/**
 * Create a quiz linked to a course (and optionally a lesson).
 */
export async function createQuiz(userId, slug, quizData) {
  const course = await Course.findOne({ slug }).lean();
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner = course.instructor.toString() === userId.toString();
  if (!isOwner && !(await isUserAdmin(userId))) {
    throw new AppError("You don't have permission to create quizzes for this course", 403);
  }

  const quiz = await Quiz.create({
    ...quizData,
    course: course._id,
  });

  return { quiz };
}

/**
 * Update an existing quiz. Only the course owner or admin can update.
 */
export async function updateQuiz(userId, quizId, data) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  await verifyCourseOwnershipForQuiz(userId, quiz.course);

  // Don't allow changing the course reference
  delete data.course;

  Object.assign(quiz, data);
  await quiz.save();

  return { quiz };
}

/**
 * Delete a quiz. Only the course owner or admin can delete.
 */
export async function deleteQuiz(userId, quizId) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  await verifyCourseOwnershipForQuiz(userId, quiz.course);

  // Clean up related attempts
  await QuizAttempt.deleteMany({ quiz: quiz._id });
  await quiz.deleteOne();

  return { message: "Quiz deleted successfully" };
}

// ── Student Quiz Flow ────────────────────────────────

/**
 * Start a quiz attempt.
 * Verifies enrollment, checks max attempts, creates a new QuizAttempt,
 * and returns questions with correct answers stripped.
 */
export async function startQuiz(userId, quizId) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    student: userId,
    course: quiz.course,
    status: "active",
  }).lean();

  if (!enrollment) {
    throw new AppError("You must be enrolled in this course to take the quiz", 403);
  }

  // Check max attempts
  const attemptCount = await QuizAttempt.countDocuments({
    student: userId,
    quiz: quiz._id,
  });

  if (attemptCount >= quiz.maxAttempts) {
    throw new AppError("Maximum attempts reached", 400);
  }

  // Create new attempt
  const attempt = await QuizAttempt.create({
    student: userId,
    quiz: quiz._id,
    attempt: attemptCount + 1,
    startedAt: new Date(),
  });

  // Strip correct answers from questions
  const strippedQuestions = quiz.questions.map((q) => {
    const question = {
      text: q.text,
      type: q.type,
      points: q.points,
      ayahRef: q.ayahRef || undefined,
    };

    if (q.options && q.options.length > 0) {
      question.options = q.options.map((opt) => ({ text: opt.text }));
    }

    return question;
  });

  return {
    attempt: {
      id: attempt._id,
      attempt: attempt.attempt,
      startedAt: attempt.startedAt,
    },
    questions: strippedQuestions,
    timeLimit: quiz.timeLimit,
    totalQuestions: quiz.questions.length,
  };
}

/**
 * Submit answers for a quiz attempt.
 * Grades answers, enforces time limit, calculates score.
 */
export async function submitQuiz(userId, quizId, attemptId, answers) {
  if (!mongoose.Types.ObjectId.isValid(quizId) || !mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new AppError("Invalid quiz or attempt ID", 400);
  }

  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt) {
    throw new AppError("Quiz attempt not found", 404);
  }

  // Verify attempt belongs to user
  if (attempt.student.toString() !== userId.toString()) {
    throw new AppError("Quiz attempt not found", 404);
  }

  // Verify not already submitted
  if (attempt.submittedAt) {
    throw new AppError("This attempt has already been submitted", 400);
  }

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  // Verify attempt belongs to this quiz
  if (attempt.quiz.toString() !== quiz._id.toString()) {
    throw new AppError("Attempt does not belong to this quiz", 400);
  }

  // Enforce time limit (with 30s grace period)
  if (quiz.timeLimit > 0) {
    const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000;
    const allowed = quiz.timeLimit * 60 + 30;
    if (elapsed > allowed) {
      throw new AppError("Time limit exceeded", 400);
    }
  }

  // Grade each answer
  let earnedPoints = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  for (const question of quiz.questions) {
    totalPoints += question.points || 1;
  }

  for (const ans of answers) {
    const { questionIndex, answer } = ans;
    const question = quiz.questions[questionIndex];

    if (!question) {
      gradedAnswers.push({ questionIndex, answer, isCorrect: false });
      continue;
    }

    let isCorrect = false;

    switch (question.type) {
      case "mcq": {
        // answer is the index of the selected option
        const selectedIndex = typeof answer === "number" ? answer : parseInt(answer, 10);
        if (
          !isNaN(selectedIndex) &&
          question.options[selectedIndex] &&
          question.options[selectedIndex].isCorrect === true
        ) {
          isCorrect = true;
        }
        break;
      }

      case "true-false": {
        // answer is a boolean or string "true"/"false"
        const expected = question.options?.find((o) => o.isCorrect)?.text;
        if (expected) {
          isCorrect =
            String(answer).toLowerCase().trim() === expected.toLowerCase().trim();
        }
        break;
      }

      case "short-answer": {
        // Basic case-insensitive comparison — scholar can review later
        const correctOption = question.options?.find((o) => o.isCorrect);
        if (correctOption) {
          isCorrect =
            String(answer).toLowerCase().trim() ===
            correctOption.text.toLowerCase().trim();
        }
        break;
      }

      case "essay":
      case "quran-recitation":
        // Cannot auto-grade — mark as pending review
        isCorrect = false;
        break;

      default:
        isCorrect = false;
    }

    if (isCorrect) {
      earnedPoints += question.points || 1;
    }

    gradedAnswers.push({ questionIndex, answer, isCorrect });
  }

  // Calculate score as percentage
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;

  // Update attempt
  attempt.answers = gradedAnswers;
  attempt.score = score;
  attempt.passed = passed;
  attempt.submittedAt = new Date();
  await attempt.save();

  // Build response
  const response = {
    score,
    passed,
    attempt: attempt.attempt,
    earnedPoints,
    totalPoints,
  };

  // Include correct answers if quiz allows it
  if (quiz.showCorrectAnswers) {
    response.correctAnswers = quiz.questions.map((q, idx) => ({
      questionIndex: idx,
      correctOption: q.options?.findIndex((o) => o.isCorrect) ?? null,
      explanation: q.explanation || null,
    }));
  }

  return response;
}

/**
 * Get all quiz results for a user.
 */
export async function getQuizResults(userId, quizId) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  const attempts = await QuizAttempt.find({
    student: userId,
    quiz: quiz._id,
  })
    .sort({ attempt: 1 })
    .lean();

  const scores = attempts
    .filter((a) => a.score != null)
    .map((a) => a.score);

  return {
    quiz: {
      _id: quiz._id,
      title: quiz.title,
      type: quiz.type,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
    },
    attempts,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    passed: attempts.some((a) => a.passed === true),
    attemptsUsed: attempts.length,
    attemptsRemaining: quiz.maxAttempts - attempts.length,
  };
}
