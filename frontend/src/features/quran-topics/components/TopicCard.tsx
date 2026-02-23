import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopicItem } from '../types';

interface TopicCardProps {
  topic: TopicItem;
}

/** Renders a Lucide icon by name, falling back to BookOpen. */
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Lucide exports many icon types; safe cast for dynamic lookup
  const Icon = (Icons as any)[name] ?? Icons.BookOpen;
  return <Icon className={className} />;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link
      to={`/quran-topics/${topic.slug}`}
      className={cn(
        'group block rounded-xl border border-border bg-card p-5',
        'transition-all hover:border-primary/40 hover:shadow-md',
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DynamicIcon name={topic.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {topic.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5">{topic.category}</span>
            <span>{topic.ayahCount} ayahs</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { DynamicIcon };
