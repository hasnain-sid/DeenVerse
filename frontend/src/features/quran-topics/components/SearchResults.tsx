import { BookOpen } from 'lucide-react';
import type { SearchMatch } from '../types';

interface SearchResultsProps {
  keyword: string;
  matches: SearchMatch[];
  count: number;
}

export function SearchResults({ keyword, matches, count }: SearchResultsProps) {
  if (count === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No results found for &quot;{keyword}&quot;. Try a different keyword.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found <span className="font-medium text-foreground">{count}</span> results for &quot;
        {keyword}&quot;
      </p>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={`${match.surahNumber}:${match.ayahNumber}`}
            className="rounded-xl border border-border bg-card p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {match.surahName} ({match.surahNameArabic}) — {match.surahNumber}:{match.ayahNumber}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{match.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
