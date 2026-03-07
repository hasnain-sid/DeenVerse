import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  useStartQuiz,
  useSubmitQuiz,
  useQuizResults,
  type QuizQuestion,
  type QuizAnswer,
  type QuizStartResponse,
  type QuizSubmitResponse,
} from '@/features/courses/useCourses';

// ── Helpers ──────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Sub-components ───────────────────────────────────

function TimerBadge({
  timeLeft,
  isSubmitted,
  isUnlimited,
}: {
  timeLeft: number;
  isSubmitted: boolean;
  isUnlimited: boolean;
}) {
  if (isUnlimited)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-mono font-bold">
        <Clock className="w-4 h-4" />
        <span>Unlimited</span>
      </div>
    );

  const isWarning = timeLeft < 120 && !isSubmitted;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold text-sm transition-colors ${
        isSubmitted
          ? 'bg-slate-100 text-slate-500'
          : isWarning
          ? 'bg-rose-100 text-rose-700 animate-pulse'
          : 'bg-indigo-100 text-indigo-700'
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(isSubmitted ? 0 : timeLeft)}</span>
    </div>
  );
}

function MCQQuestion({
  question,
  questionIndex,
  userAnswer,
  isSubmitted,
  resultAnswer,
  onChange,
}: {
  question: QuizQuestion;
  questionIndex: number;
  userAnswer: string;
  isSubmitted: boolean;
  resultAnswer?: { isCorrect: boolean };
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {question.options?.map((opt, optIdx) => {
        const val = String(optIdx);
        const isSelected = userAnswer === val;
        let style =
          'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer';

        if (isSubmitted) {
          // After submission: highlight from result answers if available
          // For now, just show selected state differently
          style = isSelected
            ? resultAnswer?.isCorrect
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 cursor-default'
              : 'border-rose-500 bg-rose-50 text-rose-800 cursor-default'
            : 'border-slate-100 text-slate-500 cursor-default opacity-60';
        } else if (isSelected) {
          style = 'border-indigo-600 bg-indigo-50/30 text-indigo-800 cursor-pointer';
        }

        return (
          <label
            key={optIdx}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${style}`}
          >
            <input
              type="radio"
              name={`q_${questionIndex}`}
              value={val}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value)}
              disabled={isSubmitted}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 disabled:opacity-50 flex-shrink-0"
            />
            <span className="leading-relaxed font-medium">{opt.text}</span>
          </label>
        );
      })}
    </div>
  );
}

function TrueFalseQuestion({
  questionIndex,
  userAnswer,
  isSubmitted,
  resultAnswer,
  onChange,
}: {
  questionIndex: number;
  userAnswer: string;
  isSubmitted: boolean;
  resultAnswer?: { isCorrect: boolean };
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-4">
      {['True', 'False'].map((option) => {
        const isSelected = userAnswer === option;
        let style = 'border-slate-200 text-slate-600 hover:border-indigo-300 cursor-pointer';

        if (isSubmitted) {
          if (isSelected) {
            style = resultAnswer?.isCorrect
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold cursor-default'
              : 'border-rose-500 bg-rose-50 text-rose-800 font-bold cursor-default';
          } else {
            style = 'border-slate-100 text-slate-400 cursor-default opacity-50';
          }
        } else if (isSelected) {
          style = 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold cursor-pointer';
        }

        return (
          <button
            key={option}
            type="button"
            onClick={() => !isSubmitted && onChange(option)}
            disabled={isSubmitted}
            className={`flex-1 p-4 rounded-xl border-2 text-center font-medium transition-all ${style}`}
            data-question-index={questionIndex}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ShortAnswerQuestion({
  userAnswer,
  isSubmitted,
  onChange,
}: {
  userAnswer: string;
  isSubmitted: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={userAnswer ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isSubmitted}
      placeholder={isSubmitted ? 'No answer provided' : 'Type your answer here...'}
      rows={4}
      className={`w-full p-4 rounded-xl border-2 outline-none transition-all resize-y text-slate-700 ${
        isSubmitted
          ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
          : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
      }`}
    />
  );
}

// ── Start Screen ─────────────────────────────────────

function StartScreen({
  quizId,
  onStart,
  isStarting,
}: {
  quizId: string;
  onStart: () => void;
  isStarting: boolean;
}) {
  const { data: results } = useQuizResults(quizId);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 max-w-lg w-full p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ready to take the quiz?</h1>
        <p className="text-slate-500 mb-6">
          {results && results.attempts.length > 0 ? (
            <>
              You have taken this quiz <strong>{results.attempts.length}</strong> time(s). Best
              score:{' '}
              <strong
                className={results.passed ? 'text-emerald-600' : 'text-rose-600'}
              >
                {results.bestScore}%
              </strong>
            </>
          ) : (
            'This is your first attempt. Take your time and do your best.'
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={onStart}
            disabled={isStarting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6"
          >
            {isStarting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Starting...
              </>
            ) : (
              'Start Quiz'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Results Screen ───────────────────────────────────

function ResultsScreen({
  submitResult,
  maxAttempts,
  attemptsUsed,
  onTryAgain,
  courseSlug,
}: {
  submitResult: QuizSubmitResponse;
  maxAttempts: number;
  attemptsUsed: number;
  onTryAgain: () => void;
  courseSlug: string;
}) {
  const navigate = useNavigate();
  const { score, passed } = submitResult;
  const canRetry = attemptsUsed < maxAttempts;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 max-w-md w-full overflow-hidden"
      >
        <div
          className={`p-8 text-center ${
            passed
              ? 'bg-emerald-50 border-b border-emerald-100'
              : 'bg-rose-50 border-b border-rose-100'
          }`}
        >
          {passed ? (
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {passed ? 'Alhamdulillah!' : 'Keep Practicing'}
          </h2>
          <p className="text-slate-600">
            {passed ? 'You passed the assessment.' : "You didn't reach the passing score."}
          </p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div
                className={`text-5xl font-black mb-1 ${
                  passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {score}%
              </div>
              <div className="text-sm text-slate-500">
                Attempt {attemptsUsed} of {maxAttempts}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {canRetry && !passed && (
              <Button
                onClick={onTryAgain}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${courseSlug}/learn`)}
              className="w-full"
            >
              Back to Course
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────

export function QuizPlayerPage() {
  const { slug = '', quizId = '' } = useParams<{ slug: string; quizId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'start' | 'in-progress' | 'results'>('start');
  const [quizData, setQuizData] = useState<QuizStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitResult, setSubmitResult] = useState<QuizSubmitResponse | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const questionRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { mutate: startQuiz, isPending: isStarting } = useStartQuiz();
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();

  // Timer countdown
  useEffect(() => {
    if (phase !== 'in-progress' || !quizData) return;
    if (quizData.quiz.timeLimit === 0) return; // unlimited

    if (timeLeft <= 0) {
      // Auto-submit on timeout
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  function handleStart() {
    startQuiz(
      { quizId },
      {
        onSuccess: (data) => {
          setQuizData(data);
          if (data.quiz.timeLimit > 0) {
            setTimeLeft(data.quiz.timeLimit * 60);
          }
          setPhase('in-progress');
        },
      }
    );
  }

  function handleAnswer(questionIndex: number, value: string) {
    if (phase !== 'in-progress') return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  }

  function handleSubmit(autoSubmit = false) {
    if (!quizData) return;

    const payload: QuizAnswer[] = Object.entries(answers).map(([idx, val]) => ({
      questionIndex: Number(idx),
      answer: val,
    }));

    submitQuiz(
      { quizId, attemptId: quizData.attemptId, answers: payload },
      {
        onSuccess: (result) => {
          setSubmitResult(result);
          setPhase('results');
          setSubmitDialogOpen(false);
          if (autoSubmit) {
            toast.error('Time is up! Your quiz was auto-submitted.');
          }
        },
      }
    );
  }

  const scrollToQuestion = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData?.questions.length ?? 0;

  // ── Start screen ─────────────────────────────────
  if (phase === 'start') {
    return (
      <StartScreen
        quizId={quizId}
        onStart={handleStart}
        isStarting={isStarting}
      />
    );
  }

  // ── Results screen ────────────────────────────────
  if (phase === 'results' && submitResult && quizData) {
    return (
      <ResultsScreen
        submitResult={submitResult}
        maxAttempts={quizData.quiz.maxAttempts}
        attemptsUsed={quizData.attempt}
        onTryAgain={() => {
          setAnswers({});
          setSubmitResult(null);
          setPhase('start');
        }}
        courseSlug={slug}
      />
    );
  }

  if (!quizData) return null;

  const isUnlimited = quizData.quiz.timeLimit === 0;

  // ── Quiz in progress ──────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-24 md:pb-0">
        {/* Sidebar (md+) */}
        <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-slate-200 z-10 pt-6">
          <div className="px-6 pb-6 border-b border-slate-100">
            <button
              onClick={() => navigate(`/courses/${slug}/learn`)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </button>
            <h2 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
              {quizData.quiz.title}
            </h2>
            <div className="flex items-center text-xs text-slate-500 gap-1.5 mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>Attempt {quizData.attempt} of {quizData.quiz.maxAttempts}</span>
            </div>

            {/* Timer Card */}
            <div
              className={`p-4 rounded-xl border-2 flex items-center justify-between shadow-sm transition-colors ${
                isUnlimited
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : timeLeft < 120
                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-700'
              }`}
            >
              <span className="text-sm font-semibold">
                {isUnlimited ? 'No limit' : 'Time Left'}
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                <Clock className="w-4 h-4" />
                <span>{isUnlimited ? '∞' : formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Questions
            </p>
            {quizData.questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined && answers[idx] !== '';
              return (
                <button
                  key={idx}
                  onClick={() => scrollToQuestion(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isAnswered
                      ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Question {idx + 1}</span>
                  {isAnswered && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t border-slate-100">
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Submit Quiz
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 relative">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={() => navigate(`/courses/${slug}/learn`)}
              className="text-slate-500 hover:text-slate-700 mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900 text-sm truncate flex-1">
              {quizData.quiz.title}
            </span>
            <TimerBadge
              timeLeft={timeLeft}
              isSubmitted={false}
              isUnlimited={isUnlimited}
            />
          </header>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 sticky top-0 z-10 md:top-0">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8">
            {/* Questions List */}
            {quizData.questions.map((question, idx) => (
              <motion.div
                key={question._id}
                ref={(el) => (questionRefs.current[idx] = el)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:border-indigo-100 transition-colors"
              >
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                      answers[idx] !== undefined && answers[idx] !== ''
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-5">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                      {question.text}
                    </h3>

                    {(question.type === 'mcq' || question.type === 'quran-recitation') && (
                      <MCQQuestion
                        question={question}
                        questionIndex={idx}
                        userAnswer={answers[idx] ?? ''}
                        isSubmitted={false}
                        onChange={(val) => handleAnswer(idx, val)}
                      />
                    )}

                    {question.type === 'true-false' && (
                      <TrueFalseQuestion
                        questionIndex={idx}
                        userAnswer={answers[idx] ?? ''}
                        isSubmitted={false}
                        onChange={(val) => handleAnswer(idx, val)}
                      />
                    )}

                    {(question.type === 'short-answer' || question.type === 'essay') && (
                      <ShortAnswerQuestion
                        userAnswer={answers[idx] ?? ''}
                        isSubmitted={false}
                        onChange={(val) => handleAnswer(idx, val)}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Bottom Submit */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <h3 className="font-bold text-xl text-slate-900 mb-2">Ready to submit?</h3>
              <p className="text-slate-500 mb-6">
                You have answered{' '}
                <span className="font-semibold text-slate-700">{answeredCount}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalQuestions}</span> questions.
                {answeredCount < totalQuestions && (
                  <span className="text-amber-600">
                    {' '}
                    ({totalQuestions - answeredCount} unanswered)
                  </span>
                )}
              </p>
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-base rounded-xl shadow-lg shadow-indigo-200"
              >
                Submit Assessment
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Overlay */}
      <AnimatePresence>
        {submitDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSubmitDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Submit Quiz?</h2>
                <button
                  onClick={() => setSubmitDialogOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {answeredCount < totalQuestions && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    You have {totalQuestions - answeredCount} unanswered question(s). These will
                    be marked as incorrect.
                  </span>
                </div>
              )}

              <p className="text-slate-600 text-sm">
                Once submitted, you cannot change your answers. Are you sure you want to finish?
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSubmitDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
