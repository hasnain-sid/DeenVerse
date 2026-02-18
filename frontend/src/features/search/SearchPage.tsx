import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, User, Compass, Loader2, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHadithSearch, useUserSearch, useCategorySearch } from './useSearch';

// ── Tabs ─────────────────────────────────────────────

type Tab = 'hadiths' | 'categories' | 'users';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'hadiths', label: 'Hadiths', icon: BookOpen },
  { id: 'categories', label: 'Categories', icon: Compass },
  { id: 'users', label: 'Users', icon: User },
];

// ── Highlight helper ─────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Main Component ───────────────────────────────────

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') ?? '';
  const initialTab = (searchParams.get('tab') as Tab) ?? 'hadiths';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        setSearchParams({ q: query.trim(), tab: activeTab }, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, activeTab, setSearchParams]);

  // Search queries
  const {
    data: hadithResults,
    isLoading: hadithLoading,
    isFetching: hadithFetching,
  } = useHadithSearch(debouncedQuery);

  const {
    data: userResults,
    isLoading: userLoading,
  } = useUserSearch(debouncedQuery);

  const {
    data: categoryResults,
    isLoading: categoryLoading,
  } = useCategorySearch(debouncedQuery);

  // Counts for tab badges
  const hadithCount = hadithResults?.length ?? 0;
  const userCount = userResults?.length ?? 0;
  const categoryCount = categoryResults?.length ?? 0;

  const isSearching = debouncedQuery.length >= 2;
  const isLoading = activeTab === 'hadiths' ? hadithLoading : activeTab === 'users' ? userLoading : categoryLoading;

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search hadiths, categories, users..."
          className="pl-10 pr-10 h-11 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {hadithFetching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Tabs */}
      {isSearching && (
        <div className="flex gap-1 border-b">
          {tabs.map((tab) => {
            const count =
              tab.id === 'hadiths' ? hadithCount :
              tab.id === 'users' ? userCount :
              categoryCount;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {isSearching && count > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {!isSearching && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Search DeenVerse</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Search for hadiths by keyword, browse categories, or find other users.
          </p>
        </div>
      )}

      {isSearching && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Hadith Results */}
      {isSearching && activeTab === 'hadiths' && !hadithLoading && (
        <div className="space-y-3">
          {hadithResults && hadithResults.length > 0 ? (
            hadithResults.map((hadith) => (
              <Card
                key={hadith.id}
                className="cursor-pointer hover:bg-secondary/50 hover:border-primary/20 transition-colors group"
                onClick={() => navigate(`/hadith?category=1&title=${encodeURIComponent(hadith.title)}`)}
              >
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                    <Highlight text={hadith.title} query={debouncedQuery} />
                  </h4>
                  {hadith.matchSnippet && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      <Highlight text={hadith.matchSnippet} query={debouncedQuery} />
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyResults query={debouncedQuery} type="hadiths" />
          )}
        </div>
      )}

      {/* Category Results */}
      {isSearching && activeTab === 'categories' && !categoryLoading && (
        <div className="space-y-3">
          {categoryResults && categoryResults.length > 0 ? (
            categoryResults.map((cat) => (
              <Card
                key={cat.id}
                className="cursor-pointer hover:bg-secondary/50 hover:border-primary/20 transition-colors group"
                onClick={() =>
                  navigate(`/hadith?category=${cat.id}&title=${encodeURIComponent(cat.title)}`)
                }
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Compass className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      <Highlight text={cat.title} query={debouncedQuery} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.hadeeths_count} hadiths
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyResults query={debouncedQuery} type="categories" />
          )}
        </div>
      )}

      {/* User Results */}
      {isSearching && activeTab === 'users' && !userLoading && (
        <div className="space-y-3">
          {userResults && userResults.length > 0 ? (
            userResults.map((u) => (
              <Card
                key={u._id}
                className="cursor-pointer hover:bg-secondary/50 hover:border-primary/20 transition-colors group"
                onClick={() => navigate(`/profile/${u._id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar src={u.avatar} fallback={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      <Highlight text={u.name} query={debouncedQuery} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @<Highlight text={u.username} query={debouncedQuery} />
                      {u.bio && <> · {u.bio.slice(0, 60)}{u.bio.length > 60 ? '…' : ''}</>}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {u.followers?.length ?? 0} followers
                  </span>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyResults query={debouncedQuery} type="users" />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyResults({ query, type }: { query: string; type: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No {type} found for "<strong>{query}</strong>"
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Try a different spelling or search term
        </p>
      </CardContent>
    </Card>
  );
}
