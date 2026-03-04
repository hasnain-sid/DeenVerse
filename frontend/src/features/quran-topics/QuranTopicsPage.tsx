import { useState, useMemo, useCallback } from 'react';
import { Play, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTopics, useMoods, useQuranSearch, useTrendingTopics } from './useQuranTopics';
import { useSmartSearch } from './useSmartSearch';
import { DynamicIcon } from './components/TopicCard';
import { SearchResults } from './components/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopicItem, MoodItem } from './types';
import { cn } from '@/lib/utils';

/** Deterministic gradient palette per slot index for topic cards */
const CARD_GRADIENTS = [
  'from-emerald-900 to-emerald-950',
  'from-indigo-900 to-indigo-950',
  'from-rose-900 to-rose-950',
  'from-slate-800 to-slate-950',
  'from-amber-900 to-amber-950',
  'from-purple-900 to-purple-950',
  'from-blue-900 to-blue-950',
  'from-teal-900 to-teal-950',
  'from-orange-900 to-orange-950',
  'from-cyan-900 to-cyan-950',
];

/** Mood color palette for the horizontal chip row */
const MOOD_COLORS: Record<string, string> = {
  Anxious:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Sad:         'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Angry:       'bg-red-500/20 text-red-400 border-red-500/30',
  Grateful:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Lost:        'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Overwhelmed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Hopeful:     'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Joyful:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};
const MOOD_FALLBACK = 'bg-muted/50 text-muted-foreground border-border';

function getGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

/** Netflix-style horizontal topic card */
function HorizontalTopicCard({ topic, index }: { topic: TopicItem; index: number }) {
  return (
    <Link
      to={`/quran-topics/${topic.slug}`}
      aria-label={`View topic: ${topic.name}`}
      className={cn(
        'shrink-0 w-52 h-32 rounded-md overflow-hidden relative cursor-pointer group',
        'bg-gradient-to-br',
        getGradient(index),
      )}
    >
      {/* Chunky background icon */}
      <DynamicIcon
        name={topic.icon}
        className="absolute -right-6 -bottom-6 w-32 h-32 text-black/20 group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
        <p className="text-xs text-white/60 mb-0.5">{topic.category}</p>
        <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
          {topic.name}
        </h3>
        <span className="text-[10px] text-white/50 mt-0.5">{topic.ayahCount} ayahs</span>
      </div>
    </Link>
  );
}

export function QuranTopicsPage() {
  const { data: topicsData, isLoading: topicsLoading } = useTopics();
  const { data: moodsData, isLoading: moodsLoading } = useMoods();
  const { data: trendingData } = useTrendingTopics();

  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchData, isLoading: searchLoading } = useQuranSearch(searchKeyword);
  const { search: smartSearch } = useSmartSearch(topicsData?.topics, moodsData?.moods);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    // Debounce-free: trigger server search for anything >= 2 chars
    if (val.trim().length >= 2) {
      setSearchKeyword(val.trim());
    } else {
      setSearchKeyword('');
    }
  }, []);

  const isSearching = searchInput.trim().length >= 2;

  /** Group topics by cluster for Netflix-style rows (flat, not nested by pillar) */
  const topicsByCluster = useMemo(() => {
    if (!topicsData?.topics) return [];
    const map = new Map<string, TopicItem[]>();
    for (const t of topicsData.topics) {
      const cluster = t.cluster ?? t.pillar ?? 'General';
      if (!map.has(cluster)) map.set(cluster, []);
      map.get(cluster)!.push(t);
    }
    return Array.from(map.entries()).map(([name, topics]) => ({ name, topics }));
  }, [topicsData]);

  /** Feature hero: first trending topic, or first topic in list */
  const heroTopic = useMemo(() => {
    if ((trendingData?.trending?.length ?? 0) > 0) return trendingData!.trending[0];
    if ((topicsData?.topics?.length ?? 0) > 0) return topicsData!.topics[0];
    return null;
  }, [trendingData, topicsData]);

  return (
    <div className="w-full bg-background min-h-screen text-foreground pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[55vh] md:h-[65vh] flex items-end pb-10 px-4 md:px-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-rose-500 rounded-full blur-[100px]" />
        </div>
        {/* Bottom fade into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 w-full max-w-4xl space-y-5">
          {heroTopic ? (
            <>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 rounded-sm">
                  #1 Trending Today
                </Badge>
                <span className="text-sm font-medium text-white/60">
                  {heroTopic.category ?? heroTopic.cluster ?? 'Quran'}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-md">
                {heroTopic.name}
              </h1>

              {heroTopic.description && (
                <p className="text-base md:text-lg text-white/80 max-w-2xl drop-shadow-sm font-medium">
                  {heroTopic.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/quran-topics/${heroTopic.slug}`}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-md font-bold hover:bg-white/90 transition-colors text-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Explore Wisdom
                </Link>
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-16 w-80 bg-white/10" />
              <Skeleton className="h-5 w-96 bg-white/10" />
            </>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="px-4 md:px-12 -mt-10 relative z-20 space-y-10">

        {/* Floating search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search topics, moods, or ayahs..."
            aria-label="Search Quran topics"
            className="pl-12 py-6 rounded-xl bg-card/60 backdrop-blur-xl border border-white/10 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-white/30"
          />
        </div>

        {/* ── Search Results ──────────────────────────────────────────── */}
        {isSearching && (
          <div className="space-y-4">
            {searchLoading ? (
              <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching…</span>
              </div>
            ) : searchData ? (
              <SearchResults
                keyword={searchData.keyword}
                matches={searchData.matches}
                count={searchData.count}
              />
            ) : smartSearch(searchInput).length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Instant results</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {smartSearch(searchInput).map((r, i) => {
                    const slug = r.topic?.slug;
                    const moodId = r.mood?.id;
                    const name = r.topic?.name ?? r.mood?.name ?? '';
                    const emoji = r.mood?.emoji ?? '';
                    return (
                      <Link
                        key={slug ?? moodId ?? i}
                        to={slug ? `/quran-topics/${slug}` : `/quran-topics/mood/${moodId}`}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="font-medium text-foreground">{name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-muted-foreground">No results for "{searchInput}"</p>
            )}
          </div>
        )}

        {/* ── Mood Chips ──────────────────────────────────────────────── */}
        {!isSearching && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground/90">How are you feeling right now?</h2>
            {moodsLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="shrink-0 h-10 w-28 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 gap-3 no-scrollbar scroll-smooth">
                {(moodsData?.moods ?? []).map((mood: MoodItem) => (
                  <Link
                    key={mood.id}
                    to={`/quran-topics/mood/${mood.id}`}
                    aria-label={`Explore mood: ${mood.name}`}
                    className={cn(
                      'shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2 rounded-full border',
                      'bg-background/50 backdrop-blur-sm transition-all hover:scale-105 font-medium text-sm',
                      MOOD_COLORS[mood.name] ?? MOOD_FALLBACK,
                    )}
                  >
                    <span role="img" aria-label={mood.name}>{mood.emoji}</span>
                    {mood.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Netflix-style cluster rows ───────────────────────────────── */}
        {!isSearching && (
          <div className="space-y-10 pb-4">
            {topicsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="shrink-0 w-52 h-32 rounded-md" />
                    ))}
                  </div>
                </div>
              ))
              : topicsByCluster.map(({ name, topics }) => (
                <div key={name} className="space-y-3">
                  <h2 className="text-lg font-bold text-foreground/90 px-1">{name}</h2>
                  <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 gap-4 no-scrollbar">
                    {topics.map((topic, i) => (
                      <HorizontalTopicCard key={topic.slug} topic={topic} index={i} />
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
