import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,

  Loader2,
  Users as UsersIcon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/features/feed/PostCard';
import { usePublicProfile, useUserPosts, useFollow } from '@/features/feed/usePosts';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username);
  const { data: postsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: postsLoading } =
    useUserPosts(username);
  const followMutation = useFollow();
  const observerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');

  const isOwnProfile = currentUser?.username === username;
  const isFollowing = profile?.isFollowing ?? false;

  // Infinite scroll
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

  const allPosts = postsData?.pages.flatMap((p) => p.posts) ?? [];

  if (profileLoading) return <ProfileSkeleton />;
  if (!profile) {
    return (
      <div className="max-w-[600px] mx-auto p-8 text-center">
        <p className="text-muted-foreground mb-4">User not found</p>
        <Link to="/feed">
          <Button variant="outline" size="sm">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 py-2.5">
        <Link to="/feed" className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">{profile.name}</h1>
          <p className="text-xs text-muted-foreground">
            {postsData?.pages[0]?.total ?? 0} posts
          </p>
        </div>
      </div>

      {/* Cover photo area */}
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />

      {/* Profile info */}
      <div className="px-4 pb-4 border-b border-border">
        {/* Avatar + action */}
        <div className="flex items-end justify-between -mt-12 mb-3">
          <Avatar
            src={profile.avatar}
            fallback={profile.name[0]}
            size="lg"
            className="border-4 border-background"
          />
          {!isOwnProfile && currentUser && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={() =>
                followMutation.mutate({
                  userId: profile._id,
                  action: isFollowing ? 'unfollow' : 'follow',
                })
              }
              disabled={followMutation.isPending}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          {isOwnProfile && (
            <Link to="/settings">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
          )}
        </div>

        {/* Name / username */}
        <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground mt-2 leading-relaxed">{profile.bio}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
          {profile.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {formatDate(profile.createdAt)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-sm">
            <span className="font-bold text-foreground">{profile.followingCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span className="text-sm">
            <span className="font-bold text-foreground">{profile.followerCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative
            ${activeTab === 'posts' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Posts
          {activeTab === 'posts' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative
            ${activeTab === 'likes' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Likes
          {activeTab === 'likes' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Posts list */}
      {postsLoading ? (
        <PostsSkeleton />
      ) : allPosts.length === 0 ? (
        <div className="py-16 text-center">
          <UsersIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {isOwnProfile ? "You haven't posted yet" : `@${username} hasn't posted yet`}
          </p>
        </div>
      ) : (
        <>
          {allPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
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

function ProfileSkeleton() {
  return (
    <div className="max-w-[600px] mx-auto">
      <div className="px-4 py-3 border-b border-border flex gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="h-32 bg-muted/20" />
      <div className="px-4 pb-4 border-b border-border">
        <div className="-mt-12 mb-3">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-3 border-b border-border flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
