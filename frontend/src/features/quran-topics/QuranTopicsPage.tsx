import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useTopics, useMoods, useQuranSearch } from './useQuranTopics';
import { TopicCard } from './components/TopicCard';
import { MoodCard } from './components/MoodCard';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';

export function QuranTopicsPage() {
  const { data: topicsData, isLoading: topicsLoading } = useTopics();
  const { data: moodsData, isLoading: moodsLoading } = useMoods();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchData, isLoading: searchLoading } = useQuranSearch(searchKeyword);

  const handleSearch = useCallback((query: string) => {
    setSearchKeyword(query);
  }, []);

  const filteredTopics = useMemo(() => {
    if (!topicsData?.topics) return [];
    if (activeCategory === 'All') return topicsData.topics;
    return topicsData.topics.filter((t) => t.category === activeCategory);
  }, [topicsData, activeCategory]);

  const categories = useMemo(() => {
    return ['All', ...(topicsData?.categories || [])];
  }, [topicsData]);

  const isLoading = topicsLoading || moodsLoading;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Quran by Topic</h1>
        </div>
        <p className="text-muted-foreground">
          Discover what the Quran says about topics that matter to you — browse by category, mood, or search by keyword.
        </p>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Search results (shown when searching) */}
      {searchKeyword && (
        <div className="space-y-4">
          {searchLoading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : searchData ? (
            <SearchResults
              keyword={searchData.keyword}
              matches={searchData.matches}
              count={searchData.count}
            />
          ) : null}
        </div>
      )}

      {/* Mood picker */}
      {!searchKeyword && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">How are you feeling?</h2>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {moodsData?.moods.map((mood) => (
                <MoodCard key={mood.id} mood={mood} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Topic grid */}
      {!searchKeyword && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Browse Topics</h2>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topics */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTopics.map((topic) => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </div>
          )}

          {!isLoading && filteredTopics.length === 0 && (
            <p className="text-center py-12 text-muted-foreground">No topics found in this category.</p>
          )}
        </section>
      )}
    </div>
  );
}
