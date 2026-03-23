import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, FileText, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { QuestionBlock } from './components/QuestionBlock';
import { QuizResultsScreen } from './components/QuizResultsScreen';
import { QuizStartScreen } from './components/QuizStartScreen';
import { QuizSubmitDialog } from './components/QuizSubmitDialog';
import { QuizTimerBadge } from './components/QuizTimerBadge';
import {
  useQuizResults,
  useStartQuiz,
  useSubmitQuiz,
  type QuizAnswer,
  type QuizStartResponse,
  type QuizSubmitResponse,
} from '@/features/courses/useCourses';

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
}

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

  const { data: quizResults } = useQuizResults(quizId);
  const { mutate: startQuiz, isPending: isStarting } = useStartQuiz();
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();

  useEffect(() => {
    if (phase !== 'in-progress' || !quizData) return;
    if (quizData.quiz.timeLimit === 0) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => setTimeLeft((previous) => previous - 1), 1000);
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
    setAnswers((previous) => ({ ...previous, [questionIndex]: value }));
  }

  function handleSubmit(autoSubmit = false) {
    if (!quizData) return;

    const payload: QuizAnswer[] = Object.entries(answers).map(([index, value]) => ({
      questionIndex: Number(index),
      answer: value,
    }));

    submitQuiz(
      { quizId, attemptId: quizData.attempt._id, answers: payload },
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

  if (phase === 'start') {
    return <QuizStartScreen onStart={handleStart} isStarting={isStarting} results={quizResults} />;
  }

  if (phase === 'results' && submitResult) {
    return (
      <QuizResultsScreen
        submitResult={submitResult}
        courseSlug={slug}
        onTryAgain={() => {
          setAnswers({});
          setSubmitResult(null);
          setPhase('start');
        }}
      />
    );
  }

  if (!quizData) return null;

  const isUnlimited = quizData.quiz.timeLimit === 0;

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24 md:flex md:flex-row md:pb-0">
        <aside className="fixed inset-y-0 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white pt-6 md:flex">
          <div className="border-b border-slate-100 px-6 pb-6">
            <button
              onClick={() => navigate(`/courses/${slug}/learn`)}
              className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </button>
            <h2 className="mb-2 line-clamp-2 font-bold leading-tight text-slate-900">
              {quizData.quiz.title}
            </h2>
            <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              <span>Attempt {quizData.attempt.attempt} of {quizData.quiz.maxAttempts}</span>
            </div>

            <div
              className={[
                'flex items-center justify-between rounded-xl border-2 p-4 shadow-sm transition-colors',
                isUnlimited
                  ? 'border-slate-200 bg-slate-50 text-slate-600'
                  : timeLeft < 120
                    ? 'animate-pulse border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-indigo-100 bg-indigo-50 text-indigo-700',
              ].join(' ')}
            >
              <span className="text-sm font-semibold">{isUnlimited ? 'No limit' : 'Time Left'}</span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                <Clock className="h-4 w-4" />
                <span>{isUnlimited ? '∞' : formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-4">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Questions
            </p>
            {quizData.questions.map((_, index) => {
              const isAnswered = answers[index] !== undefined && answers[index] !== '';
              return (
                <button
                  key={index}
                  onClick={() => scrollToQuestion(index)}
                  className={[
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    isAnswered
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')}
                >
                  <span>Question {index + 1}</span>
                  {isAnswered && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-4">
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Submit Quiz
            </Button>
          </div>
        </aside>

        <main className="relative flex-1 md:ml-64">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:hidden">
            <button
              onClick={() => navigate(`/courses/${slug}/learn`)}
              className="mr-3 text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="flex-1 truncate text-sm font-bold text-slate-900">
              {quizData.quiz.title}
            </span>
            <QuizTimerBadge
              timeLeft={timeLeft}
              isSubmitted={false}
              isUnlimited={isUnlimited}
              formatTime={formatTime}
            />
          </header>

          <div className="sticky top-0 z-10 h-1 bg-slate-100 md:top-0">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-8">
            {quizData.questions.map((question, index) => (
              <QuestionBlock
                key={question._id}
                question={question}
                questionIndex={index}
                userAnswer={answers[index] ?? ''}
                onChange={(value) => handleAnswer(index, value)}
                containerRef={(element) => {
                  questionRefs.current[index] = element;
                }}
              />
            ))}

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-slate-900">Ready to submit?</h3>
              <p className="mb-6 text-slate-500">
                You have answered <span className="font-semibold text-slate-700">{answeredCount}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalQuestions}</span> questions.
                {answeredCount < totalQuestions && (
                  <span className="text-amber-600"> ({totalQuestions - answeredCount} unanswered)</span>
                )}
              </p>
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-base text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Submit Assessment
              </Button>
            </div>
          </div>
        </main>
      </div>

      <QuizSubmitDialog
        isOpen={submitDialogOpen}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
        onClose={() => setSubmitDialogOpen(false)}
        onSubmit={() => handleSubmit()}
      />
    </>
  );
}
