import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { MoodItem } from '../types';

interface MoodCardProps {
  mood: MoodItem;
}

export function MoodCard({ mood }: MoodCardProps) {
  return (
    <Link
      to={`/quran-topics/mood/${mood.id}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4',
        'transition-all hover:border-primary/40 hover:shadow-md text-center',
      )}
    >
      <span className="text-3xl" role="img" aria-label={mood.name}>
        {mood.emoji}
      </span>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {mood.name}
      </span>
    </Link>
  );
}
