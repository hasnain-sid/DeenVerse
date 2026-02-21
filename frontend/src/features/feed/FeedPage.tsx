import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from './PostCard';
import { CreatePostComposer } from './CreatePostComposer';
import { useFeed, useTrendingHashtags, useFollowSuggestions, useFollow } from './usePosts';

type Tab = 'following' | 'trending';

export function FeedPage() {
  const [tab, setTab] = useState<Tab>('following');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useFeed(tab);
  const observerRef = useRef<HTMLDivElement>(null);

  // ── Infinite scroll ──────────────────────────────────────────────────────
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Feed Header */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-md py-3 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTab('following')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${tab === 'following' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Following
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${tab === 'trending' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Composer */}
      <CreatePostComposer placeholder="Share a thought, hadith, or reflection..." />

      {/* Feed */}
      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>Failed to load your feed.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : allPosts.length === 0 ? (
        <EmptyFeed tab={tab} />
      ) : (
        <>
          {allPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-12 flex items-center justify-center">
            {isFetchingNextPage && (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyFeed({ tab }: { tab: Tab }) {
  return (
    <div className="py-16 px-4 text-center">
      <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {tab === 'following' ? 'Your feed is empty' : 'Nothing trending yet'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        {tab === 'following'
          ? 'Follow other users or share your first post to get started.'
          : 'Be the first to start a conversation!'}
      </p>

      {tab === 'following' && <WhoToFollow />}
    </div>
  );
}

// ─── Who to Follow widget ────────────────────────────────────────────────────

function WhoToFollow() {
  const { data } = useFollowSuggestions();
  const followMutation = useFollow();

  if (!data?.suggestions?.length) return null;

  return (
    <div className="border border-border rounded-xl p-4 text-left mx-auto max-w-sm">
      <h4 className="font-semibold text-foreground text-sm mb-3">Who to follow</h4>
      <div className="space-y-3">
        {data.suggestions.slice(0, 3).map((u) => (
          <div key={u._id} className="flex items-center gap-3">
            <Link to={`/user/${u.username}`}>
              <Avatar src={u.avatar} fallback={u.name?.[0] || '?'} size="sm" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/user/${u.username}`}
                className="text-sm font-medium text-foreground hover:underline block truncate"
              >
                {u.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => followMutation.mutate({ userId: u._id, action: 'follow' })}
              disabled={followMutation.isPending}
              className="text-xs h-7"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trending widget (sidebar) ───────────────────────────────────────────────

export function TrendingWidget() {
  const { data } = useTrendingHashtags();

  if (!data?.hashtags?.length) return null;

  return (
    <div className="border border-border rounded-xl p-4">
      <h4 className="font-semibold text-foreground text-sm mb-3">Trending</h4>
      <div className="space-y-2.5">
        {data.hashtags.slice(0, 5).map((h) => (
          <Link
            key={h._id}
            to={`/search?q=${encodeURIComponent('#' + h._id)}&tab=hashtags`}
            className="block hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
          >
            <p className="text-sm font-medium text-foreground">#{h._id}</p>
            <p className="text-xs text-muted-foreground">{h.count} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-[20px] border border-border p-5 flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-6 pt-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
