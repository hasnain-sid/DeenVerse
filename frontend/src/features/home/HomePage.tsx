import { Radio, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  useDailyLearningHome,
  useStreak,
  useRecentCollections,
  useLiveStream,
  useHomeStats,
} from './useHome';

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'Guest';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // ─── Data hooks ──────────────────────────────────
  const { data: dailyLearning, isLoading: learningLoading } = useDailyLearningHome();
  const { data: streak } = useStreak(isAuthenticated);
  const { data: collections } = useRecentCollections(isAuthenticated);
  const { data: liveStream } = useLiveStream();
  const { data: homeStats } = useHomeStats(isAuthenticated);

  const streakCurrent = streak?.current ?? 0;

  // Create Spotlight cells dynamically based on real data
  const SPOTLIGHT_CELLS = [
    {
      id: 'learning',
      label: 'Daily Learning',
      icon: Heart,
      gradient: 'from-orange-500/10 to-transparent',
      arabic: !learningLoading && dailyLearning ? dailyLearning.arabic : '',
      text: learningLoading ? 'Loading...' : dailyLearning ? `"${dailyLearning.translation}"` : 'Start your learning journey',
      meta: 'Daily Reading',
      link: '/daily-learning',
    },
    {
      id: 'stream',
      label: liveStream ? 'Live Now' : 'Streams',
      icon: Radio,
      gradient: 'from-red-500/10 to-transparent',
      text: liveStream ? liveStream.title : 'No live streams right now',
      meta: liveStream
        ? `${liveStream.host.name} · ${liveStream.viewerCount} watching`
        : 'Check back later for live content',
      live: !!liveStream,
      link: '/streams',
    },
  ];

  // Map stats dynamically
  const STATS = [
    { value: streakCurrent.toString(), label: 'Day Streak', highlight: true },
    { value: homeStats?.versesLearned?.toString() ?? '0', label: 'Verses Learned', highlight: false },
    { value: homeStats?.activeCourses?.toString() ?? '0', label: 'Active Courses', highlight: false },
    { value: collections ? collections.length.toString() : '0', label: 'Saved Items', highlight: false },
  ];

  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isAuthenticated ? `Assalamu Alaikum, ${userName}` : 'Assalamu Alaikum'}
        </h1>
        <p className="text-muted-foreground mt-1">{currentDate}</p>
      </div>

      {/* 2x2 Spotlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {SPOTLIGHT_CELLS.map((cell) => (
          <Link
            key={cell.id}
            to={cell.link}
            onMouseEnter={() => setSelectedCell(cell.id)}
            onMouseLeave={() => setSelectedCell(null)}
            className={cn(
              'block rounded-[20px] bg-card border p-6 text-left transition-all group relative overflow-hidden',
              selectedCell === cell.id
                ? 'border-primary ring-1 ring-primary/20'
                : 'border-border hover:border-primary/30'
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br transition-opacity duration-500',
              selectedCell === cell.id ? 'opacity-100' : 'opacity-40', cell.gradient)} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <cell.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {cell.label}
                </span>
                {cell.live && (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-500 uppercase">Live</span>
                  </span>
                )}
              </div>

              {cell.id === 'learning' && learningLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : (
                <>
                  {cell.arabic && (
                    <p className="font-arabic text-xl md:text-2xl leading-relaxed mb-2 text-card-foreground line-clamp-2">
                      {cell.arabic}
                    </p>
                  )}

                  <p className="text-card-foreground/80 text-sm md:text-base leading-relaxed line-clamp-2 font-medium">
                    {cell.text}
                  </p>
                </>
              )}

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">{cell.meta}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className={cn(
              'rounded-[20px] p-5 flex flex-col items-center text-center transition-transform hover:scale-[1.02]',
              stat.highlight
                ? 'bg-gradient-to-br from-primary to-brand-600 text-primary-foreground shadow-sm'
                : 'bg-card border border-border'
            )}
          >
            <p className={cn('text-2xl md:text-3xl font-bold mb-1', !stat.highlight && 'text-foreground')}>
              {stat.value}
            </p>
            <p
              className={cn(
                'text-[10px] uppercase tracking-widest font-semibold',
                stat.highlight ? 'opacity-80' : 'text-muted-foreground'
              )}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
