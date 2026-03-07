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
    const result = await createQuiz(req.user, slug, req.body);
    return res.status(201).json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateQuizHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await updateQuiz(req.user, quizId, req.body);
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
    const { attemptId, answers } = req.body;
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
