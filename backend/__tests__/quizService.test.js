import { startQuiz, submitQuiz, getQuizResults, deleteQuiz } from "../services/quizService.js";
import { Quiz } from "../models/quizSchema.js";
import { QuizAttempt } from "../models/quizAttemptSchema.js";
import { Enrollment } from "../models/enrollmentSchema.js";
import { Course } from "../models/courseSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

// ── Mock dependencies ───────────────────────────────

jest.mock("../models/quizSchema.js", () => ({
  Quiz: { findById: jest.fn() },
}));

jest.mock("../models/quizAttemptSchema.js", () => ({
  QuizAttempt: {
    countDocuments: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    exists: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock("../models/enrollmentSchema.js", () => ({
  Enrollment: { findOne: jest.fn() },
}));

jest.mock("../models/courseSchema.js", () => ({
  Course: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.mock("../models/userSchema.js", () => ({
  User: { findById: jest.fn() },
}));

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────

const QUIZ_ID = new mongoose.Types.ObjectId().toString();
const COURSE_ID = new mongoose.Types.ObjectId().toString();
const USER_ID = new mongoose.Types.ObjectId().toString();
const ATTEMPT_ID = new mongoose.Types.ObjectId().toString();

function makeQuiz(overrides = {}) {
  return {
    _id: QUIZ_ID,
    course: COURSE_ID,
    title: "Fiqh Basics Quiz",
    type: "quiz",
    timeLimit: 30, // minutes
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    questions: [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        text: "What is the first pillar of Islam?",
        type: "mcq",
        options: [
          { text: "Shahada", isCorrect: true },
          { text: "Salah", isCorrect: false },
          { text: "Zakat", isCorrect: false },
        ],
        points: 2,
        explanation: "Shahada is the declaration of faith.",
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        text: "Ramadan is the 9th month of the Islamic calendar.",
        type: "true-false",
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
        points: 1,
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        text: "How many daily prayers are obligatory?",
        type: "mcq",
        options: [
          { text: "3", isCorrect: false },
          { text: "5", isCorrect: true },
          { text: "7", isCorrect: false },
        ],
        points: 2,
      },
    ],
    ...overrides,
  };
}

function makeAttemptDoc(overrides = {}) {
  const doc = {
    _id: ATTEMPT_ID,
    student: USER_ID,
    quiz: QUIZ_ID,
    attempt: 1,
    startedAt: new Date(),
    submittedAt: null,
    answers: [],
    score: null,
    passed: null,
    save: jest.fn().mockResolvedValue(undefined),
    toString() {
      return this._id;
    },
    ...overrides,
  };
  // Ensure student/quiz have toString
  doc.student = { toString: () => overrides.student || USER_ID };
  doc.quiz = { toString: () => overrides.quiz || QUIZ_ID };
  return doc;
}

beforeEach(() => jest.clearAllMocks());

// ────── startQuiz ───────────────────────────────────

describe("startQuiz", () => {
  it("creates attempt and strips correct answers from response", async () => {
    const quiz = makeQuiz();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(quiz) });
    Enrollment.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "enr1" }) });
    QuizAttempt.countDocuments.mockResolvedValue(0);
    QuizAttempt.create.mockResolvedValue({
      _id: ATTEMPT_ID,
      attempt: 1,
      startedAt: new Date(),
    });

    const result = await startQuiz(USER_ID, QUIZ_ID);

    expect(result.quiz).toMatchObject({
      _id: QUIZ_ID,
      title: "Fiqh Basics Quiz",
      timeLimit: 30,
      maxAttempts: 3,
      totalQuestions: 3,
    });
    expect(result.attempt).toMatchObject({ _id: ATTEMPT_ID, attempt: 1 });
    expect(result.questions).toHaveLength(3);
    expect(result.questions[0]).toHaveProperty("_id");

    // Verify correct answers are stripped
    for (const q of result.questions) {
      if (q.options) {
        for (const opt of q.options) {
          expect(opt).not.toHaveProperty("isCorrect");
        }
      }
    }
  });

  it("rejects when maxAttempts reached (400)", async () => {
    const quiz = makeQuiz({ maxAttempts: 2 });
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(quiz) });
    Enrollment.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "enr1" }) });
    QuizAttempt.countDocuments.mockResolvedValue(2); // Already at max

    await expect(startQuiz(USER_ID, QUIZ_ID)).rejects.toThrow(AppError);
    await expect(startQuiz(USER_ID, QUIZ_ID)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects for non-enrolled student (403)", async () => {
    const quiz = makeQuiz();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(quiz) });
    Enrollment.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });

    await expect(startQuiz(USER_ID, QUIZ_ID)).rejects.toThrow(AppError);
    await expect(startQuiz(USER_ID, QUIZ_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects archived quizzes before creating an attempt", async () => {
    const archivedQuiz = makeQuiz({ status: "archived" });
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(archivedQuiz) });

    await expect(startQuiz(USER_ID, QUIZ_ID)).rejects.toMatchObject({
      statusCode: 410,
      message: expect.stringMatching(/no longer available/i),
    });

    expect(Enrollment.findOne).not.toHaveBeenCalled();
    expect(QuizAttempt.create).not.toHaveBeenCalled();
  });
});

// ────── submitQuiz ──────────────────────────────────

describe("submitQuiz", () => {
  function setupSubmit(attemptOverrides = {}, quizOverrides = {}) {
    const quiz = makeQuiz(quizOverrides);
    const attempt = makeAttemptDoc(attemptOverrides);

    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(quiz) });
    QuizAttempt.findById.mockResolvedValue(attempt);

    return { quiz, attempt };
  }

  it("grades MCQ correctly (correct + wrong cases)", async () => {
    const { attempt } = setupSubmit();

    const answers = [
      { questionIndex: 0, answer: 0 }, // Shahada — correct
      { questionIndex: 1, answer: "True" }, // true-false, handled by mcq check → wrong path, but question is true-false
      { questionIndex: 2, answer: 0 }, // "3" — wrong
    ];

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, answers);

    // Q0 (MCQ, 2pts): correct → 2pts. Q1 (true-false, 1pt): "True" matches "True" → 1pt. Q2 (MCQ, 2pts): wrong → 0
    // Total earned: 3, total: 5, score = round(3/5*100) = 60
    expect(result.quiz).toMatchObject({ _id: QUIZ_ID, totalQuestions: 3 });
    expect(result.attempt).toMatchObject({ _id: ATTEMPT_ID, attempt: 1, score: 60, passed: false });
    expect(result.score).toBe(60);
    expect(result.earnedPoints).toBe(3);
    expect(result.totalPoints).toBe(5);
    expect(result.answers).toHaveLength(3);
    expect(result.answers[0]).toMatchObject({ questionIndex: 0, answer: 0, isCorrect: true });
    expect(result.questions).toHaveLength(3);
    expect(result.questions[0]).toHaveProperty("correctOptionIndex");
    expect(attempt.save).toHaveBeenCalled();
  });

  it("grades true/false correctly", async () => {
    const tfQuiz = makeQuiz({
      questions: [
        {
          text: "The Quran has 114 surahs.",
          type: "true-false",
          options: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
          points: 1,
        },
      ],
      passingScore: 100,
    });

    const attempt = makeAttemptDoc();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(tfQuiz) });
    QuizAttempt.findById.mockResolvedValue(attempt);

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [
      { questionIndex: 0, answer: "True" },
    ]);

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.attempt).toMatchObject({ attempt: 1, score: 100, passed: true });
  });

  it("enforces time limit (rejects late submission, 400)", async () => {
    // startedAt 60 minutes ago, timeLimit is 30 min (+ 30s grace = 1830s, but 3600s elapsed)
    const longAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { attempt } = setupSubmit({ startedAt: longAgo });
    // Override startedAt on the inner doc
    attempt.startedAt = longAgo;

    await expect(
      submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [{ questionIndex: 0, answer: 0 }])
    ).rejects.toThrow(AppError);
    await expect(
      submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [{ questionIndex: 0, answer: 0 }])
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects already-submitted attempt", async () => {
    const { attempt } = setupSubmit({ submittedAt: new Date() });
    attempt.submittedAt = new Date();

    await expect(
      submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [])
    ).rejects.toThrow(AppError);
    await expect(
      submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [])
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("calculates score correctly", async () => {
    // All correct answers → score should be 100
    const { attempt } = setupSubmit();

    const answers = [
      { questionIndex: 0, answer: 0 }, // Shahada — correct (2pts)
      { questionIndex: 1, answer: "True" }, // correct (1pt)
      { questionIndex: 2, answer: 1 }, // 5 — correct (2pts)
    ];

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, answers);

    expect(result.score).toBe(100);
    expect(result.earnedPoints).toBe(5);
    expect(result.totalPoints).toBe(5);
    expect(result.answers.every((answer) => answer.isCorrect)).toBe(true);
  });

  it("marks passed/failed based on passingScore", async () => {
    // passingScore = 70, score will be 40% (only 2pts of 5)
    const { attempt } = setupSubmit();

    const answers = [
      { questionIndex: 0, answer: 2 }, // wrong (0pts)
      { questionIndex: 1, answer: "True" }, // correct (1pt)
      { questionIndex: 2, answer: 0 }, // wrong (0pts)
    ];

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, answers);

    // 1 of 5 points → 20%
    expect(result.score).toBe(20);
    expect(result.passed).toBe(false);
  });

  it("grades short-answer answers case-insensitively", async () => {
    const shortAnswerQuiz = makeQuiz({
      passingScore: 100,
      questions: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          text: "Begin recitation with which phrase?",
          type: "short-answer",
          options: [{ text: "Bismillah", isCorrect: true }],
          points: 2,
          explanation: "Students should write Bismillah.",
        },
      ],
    });
    const attempt = makeAttemptDoc();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(shortAnswerQuiz) });
    QuizAttempt.findById.mockResolvedValue(attempt);

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [
      { questionIndex: 0, answer: "  bIsMiLlAh  " },
    ]);

    expect(result.score).toBe(100);
    expect(result.earnedPoints).toBe(2);
    expect(result.answers[0]).toMatchObject({
      questionIndex: 0,
      answer: "  bIsMiLlAh  ",
      isCorrect: true,
    });
  });

  it("marks essay and quran-recitation answers as manually graded", async () => {
    const manualReviewQuiz = makeQuiz({
      passingScore: 50,
      questions: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          text: "Explain the importance of intention.",
          type: "essay",
          points: 2,
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          text: "Recite Surah Al-Fatihah.",
          type: "quran-recitation",
          points: 3,
        },
      ],
    });
    const attempt = makeAttemptDoc();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(manualReviewQuiz) });
    QuizAttempt.findById.mockResolvedValue(attempt);

    const result = await submitQuiz(USER_ID, QUIZ_ID, ATTEMPT_ID, [
      { questionIndex: 0, answer: "A sincere act is for Allah alone." },
      { questionIndex: 1, answer: "audio-file-id" },
    ]);

    expect(result.score).toBe(0);
    expect(result.earnedPoints).toBe(0);
    expect(result.answers).toEqual([
      expect.objectContaining({ questionIndex: 0, isCorrect: false }),
      expect.objectContaining({ questionIndex: 1, isCorrect: false }),
    ]);
  });
});

// ────── deleteQuiz ──────────────────────────────────

describe("deleteQuiz", () => {
  function mockOwnedQuiz(overrides = {}) {
    const quizDoc = {
      _id: QUIZ_ID,
      course: COURSE_ID,
      status: "active",
      save: jest.fn().mockResolvedValue(undefined),
      deleteOne: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };

    Quiz.findById.mockResolvedValue(quizDoc);
    Course.findById.mockReturnValue({
      lean: () => Promise.resolve({ _id: COURSE_ID, instructor: USER_ID }),
    });

    return quizDoc;
  }

  it("soft-archives quizzes when submitted attempts exist", async () => {
    const quizDoc = mockOwnedQuiz();
    QuizAttempt.exists.mockResolvedValue({ _id: "attempt1" });

    const result = await deleteQuiz(USER_ID, QUIZ_ID);

    expect(quizDoc.status).toBe("archived");
    expect(quizDoc.save).toHaveBeenCalled();
    expect(QuizAttempt.deleteMany).not.toHaveBeenCalled();
    expect(quizDoc.deleteOne).not.toHaveBeenCalled();
    expect(result.message).toMatch(/archived/i);
  });

  it("hard-deletes quizzes when no submitted attempts exist", async () => {
    const quizDoc = mockOwnedQuiz();
    QuizAttempt.exists.mockResolvedValue(null);
    QuizAttempt.deleteMany.mockResolvedValue({ deletedCount: 0 });

    const result = await deleteQuiz(USER_ID, QUIZ_ID);

    expect(QuizAttempt.deleteMany).toHaveBeenCalledWith({ quiz: QUIZ_ID });
    expect(quizDoc.deleteOne).toHaveBeenCalled();
    expect(result.message).toMatch(/deleted successfully/i);
  });
});

// ────── getQuizResults ──────────────────────────────

describe("getQuizResults", () => {
  it("returns all attempts + bestScore + passed flag", async () => {
    const quiz = makeQuiz();
    Quiz.findById.mockReturnValue({ lean: () => Promise.resolve(quiz) });

    const attempts = [
      { _id: "a1", attempt: 1, score: 40, passed: false, startedAt: new Date("2026-01-01") },
      { _id: "a2", attempt: 2, score: 80, passed: true, startedAt: new Date("2026-01-02") },
      { _id: "a3", attempt: 3, score: 60, passed: false, startedAt: new Date("2026-01-03") },
    ];

    QuizAttempt.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: () => Promise.resolve(attempts),
      }),
    });

    const result = await getQuizResults(USER_ID, QUIZ_ID);

    expect(result.attempts).toHaveLength(3);
    expect(result.attempts[0]).toMatchObject({ _id: "a1", attempt: 1, score: 40, passed: false });
    expect(result.bestScore).toBe(80);
    expect(result.passed).toBe(true);
    expect(result.attemptsUsed).toBe(3);
    expect(result.attemptsRemaining).toBe(0); // 3 max - 3 used
    expect(result.quiz).toMatchObject({
      _id: QUIZ_ID,
      title: "Fiqh Basics Quiz",
      passingScore: 70,
      maxAttempts: 3,
      totalQuestions: 3,
    });
  });
});
