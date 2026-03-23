import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { QuizSubmitResponse } from '../useCourses';

interface QuizResultsScreenProps {
  submitResult: QuizSubmitResponse;
  courseSlug: string;
  onTryAgain: () => void;
}

export function QuizResultsScreen({
  submitResult,
  courseSlug,
  onTryAgain,
}: QuizResultsScreenProps) {
  const navigate = useNavigate();
  const { score, passed } = submitResult;
  const attemptsUsed = submitResult.attempt.attempt;
  const maxAttempts = submitResult.quiz.maxAttempts;
  const canRetry = attemptsUsed < maxAttempts;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm"
      >
        <div
          className={[
            'border-b p-8 text-center',
            passed ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50',
          ].join(' ')}
        >
          {passed ? (
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-rose-500" />
          )}
          <h2 className="mb-1 text-2xl font-bold text-slate-900">
            {passed ? 'Alhamdulillah!' : 'Keep Practicing'}
          </h2>
          <p className="text-slate-600">
            {passed ? 'You passed the assessment.' : "You didn't reach the passing score."}
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <div className="text-center">
              <div
                className={[
                  'mb-1 text-5xl font-black',
                  passed ? 'text-emerald-600' : 'text-rose-600',
                ].join(' ')}
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
                className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
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
