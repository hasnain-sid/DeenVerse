import {
  createQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
} from "@deenverse/shared";
import { AppError } from "../utils/AppError.js";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getQuizResults,
} from "../services/quizService.js";

// ── Scholar Quiz Management ──────────────────────────

export const createQuizHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await createQuiz(req.user, slug, parsed.data);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateQuizHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const parsed = updateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const result = await updateQuiz(req.user, quizId, parsed.data);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteQuizHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await deleteQuiz(req.user, quizId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

// ── Student Quiz Flow ────────────────────────────────

export const startQuizHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await startQuiz(req.user, quizId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const submitQuizHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const parsed = submitQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { attemptId, answers } = parsed.data;
    const result = await submitQuiz(req.user, quizId, attemptId, answers);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const getQuizResultsHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await getQuizResults(req.user, quizId);
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};
