import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DynamicIcon } from './TopicCard';
import type { SmartSearchResult } from '../useSmartSearch';

interface SearchBarProps {
  onKeywordSearch: (query: string) => void;
  smartSearch: (query: string) => SmartSearchResult[];
  placeholder?: string;
}

export function SearchBar({
  onKeywordSearch,
  smartSearch,
  placeholder = 'Search topics, moods, or the Quran...',
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const [smartResults, setSmartResults] = useState<SmartSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced smart search
  useEffect(() => {
    if (value.trim().length < 2) {
      setSmartResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      const results = smartSearch(value);
      setSmartResults(results);
      setShowDropdown(results.length > 0);
    }, 150);

    return () => clearTimeout(timer);
  }, [value, smartSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim().length >= 2) {
        setShowDropdown(false);
        onKeywordSearch(value.trim());
      }
    },
    [value, onKeywordSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    setSmartResults([]);
    setShowDropdown(false);
    onKeywordSearch('');
  }, [onKeywordSearch]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => smartResults.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-9 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Smart search dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-fade-in">
          {/* Smart matches header */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/50">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Smart matches ({smartResults.length})
            </span>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {smartResults.slice(0, 8).map((result) => {
              if (result.type === 'topic' && result.topic) {
                return (
                  <Link
                    key={`topic-${result.topic.slug}`}
                    to={`/quran-topics/${result.topic.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DynamicIcon name={result.topic.icon} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {result.topic.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.topic.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {result.topic.category}
                    </span>
                  </Link>
                );
              }

              if (result.type === 'mood' && result.mood) {
                return (
                  <Link
                    key={`mood-${result.mood.id}`}
                    to={`/quran-topics/mood/${result.mood.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 transition-colors"
                  >
                    <span className="text-2xl shrink-0" role="img" aria-label={result.mood.name}>
                      {result.mood.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {result.mood.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.mood.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      Mood
                    </span>
                  </Link>
                );
              }

              return null;
            })}
          </div>

          {/* Full Quran search fallback */}
          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              onKeywordSearch(value.trim());
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-xs text-muted-foreground hover:bg-secondary/40 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Search full Quran text for &quot;{value.trim()}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
