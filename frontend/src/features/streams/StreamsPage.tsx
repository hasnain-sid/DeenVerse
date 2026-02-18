import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Clock, Film, Users, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useLiveStreams, useScheduledStreams, useRecordings } from './useStreams';
import type { Stream } from '@/types/stream';

const categoryLabels: Record<string, string> = {
  lecture: 'Lecture',
  quran_recitation: 'Quran Recitation',
  qa_session: 'Q&A Session',
  discussion: 'Discussion',
  other: 'Other',
};

const categoryFilters = [
  { label: 'All', value: '' },
  { label: 'Lectures', value: 'lecture' },
  { label: 'Quran', value: 'quran_recitation' },
  { label: 'Q&A', value: 'qa_session' },
  { label: 'Discussion', value: 'discussion' },
];

type Tab = 'live' | 'scheduled' | 'recordings';

function StreamCard({ stream }: { stream: Stream }) {
  const isLive = stream.status === 'live';

  return (
    <Link
      to={`/streams/${stream._id}`}
      className="group block rounded-xl border bg-card overflow-hidden hover:border-primary/30 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary flex items-center justify-center">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Radio className="h-12 w-12 text-muted-foreground/20" />
        )}
        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
        {/* Viewer count */}
        {isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
            <Users className="h-3 w-3" />
            {stream.viewerCount}
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <Play className="h-12 w-12 text-white fill-white/80" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <Avatar
            fallback={stream.host.name}
            src={stream.host.avatar}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate leading-tight">{stream.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{stream.host.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                {categoryLabels[stream.category] || stream.category}
              </span>
              {stream.status === 'scheduled' && stream.scheduledFor && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(stream.scheduledFor).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {stream.status === 'ended' && stream.endedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(stream.endedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StreamGrid({ streams, loading }: { streams?: Stream[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!streams || streams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Radio className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">No streams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {streams.map((stream) => (
        <StreamCard key={stream._id} stream={stream} />
      ))}
    </div>
  );
}

export function StreamsPage() {
  const [tab, setTab] = useState<Tab>('live');
  const [category, setCategory] = useState('');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: liveData, isLoading: liveLoading } = useLiveStreams(
    tab === 'live' ? category || undefined : undefined
  );
  const { data: scheduledData, isLoading: scheduledLoading } = useScheduledStreams();
  const { data: recordingsData, isLoading: recordingsLoading } = useRecordings();

  const tabs: { key: Tab; label: string; icon: typeof Radio }[] = [
    { key: 'live', label: 'Live Now', icon: Radio },
    { key: 'scheduled', label: 'Upcoming', icon: Clock },
    { key: 'recordings', label: 'Recordings', icon: Film },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Streams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Watch live Islamic lectures, Quran recitations, and discussions
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/go-live">
            <Button className="gap-2">
              <Radio className="h-4 w-4" />
              Go Live
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.key === 'live' && liveData && liveData.total > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white px-1">
                {liveData.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Category filters (only for live tab) */}
      {tab === 'live' && (
        <div className="flex items-center gap-2 flex-wrap">
          {categoryFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                category === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Stream grid */}
      {tab === 'live' && <StreamGrid streams={liveData?.streams} loading={liveLoading} />}
      {tab === 'scheduled' && (
        <StreamGrid streams={scheduledData?.streams} loading={scheduledLoading} />
      )}
      {tab === 'recordings' && (
        <StreamGrid streams={recordingsData?.streams} loading={recordingsLoading} />
      )}
    </div>
  );
}
