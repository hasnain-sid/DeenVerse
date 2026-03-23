import { Clock } from 'lucide-react';

interface QuizTimerBadgeProps {
  timeLeft: number;
  isSubmitted: boolean;
  isUnlimited: boolean;
  formatTime: (seconds: number) => string;
}

export function QuizTimerBadge({
  timeLeft,
  isSubmitted,
  isUnlimited,
  formatTime,
}: QuizTimerBadgeProps) {
  if (isUnlimited) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold font-mono text-slate-600">
        <Clock className="h-4 w-4" />
        <span>Unlimited</span>
      </div>
    );
  }

  const isWarning = timeLeft < 120 && !isSubmitted;

  return (
    <div
      className={[
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold font-mono transition-colors',
        isSubmitted
          ? 'bg-slate-100 text-slate-500'
          : isWarning
            ? 'animate-pulse bg-rose-100 text-rose-700'
            : 'bg-indigo-100 text-indigo-700',
      ].join(' ')}
    >
      <Clock className="h-4 w-4" />
      <span>{formatTime(isSubmitted ? 0 : timeLeft)}</span>
    </div>
  );
}
