import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizSubmitDialogProps {
  isOpen: boolean;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function QuizSubmitDialog({
  isOpen,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onClose,
  onSubmit,
}: QuizSubmitDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Submit Quiz?</h2>
              <button onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {answeredCount < totalQuestions && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  You have {totalQuestions - answeredCount} unanswered question(s). These will be marked as incorrect.
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Once submitted, you cannot change your answers. Are you sure you want to finish?
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
  );
}
