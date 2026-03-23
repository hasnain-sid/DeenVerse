import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizResultsResponse } from '../useCourses';

interface QuizStartScreenProps {
  isStarting: boolean;
  onStart: () => void;
  results?: QuizResultsResponse;
}

export function QuizStartScreen({ isStarting, onStart, results }: QuizStartScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <FileText className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Ready to take the quiz?</h1>
        <p className="mb-6 text-slate-500">
          {results && results.attempts.length > 0 ? (
            <>
              You have taken this quiz <strong>{results.attemptsUsed}</strong> time(s). Best score:{' '}
              <strong className={results.passed ? 'text-emerald-600' : 'text-rose-600'}>
                {results.bestScore}%
              </strong>
            </>
          ) : (
            'This is your first attempt. Take your time and do your best.'
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={onStart}
            disabled={isStarting}
            className="gap-2 bg-indigo-600 px-6 text-white hover:bg-indigo-700"
          >
            {isStarting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
