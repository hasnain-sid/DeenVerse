import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, UserPlus, UserMinus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import type { User } from '@/types/user';

export function CommunityPage() {
  const { user: currentUser, isAuthenticated, setUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch other users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['other-users'],
    queryFn: async () => {
      const res = await api.get('/user/users');
      return res.data.otherUsers;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post('/user/follow', { id: userId });
    },
    onSuccess: async (_data, userId) => {
      toast.success('Followed!');
      // Update local auth store
      if (currentUser) {
        setUser({
          ...currentUser,
          following: [...currentUser.following, userId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['other-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to follow');
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post('/user/unfollow', { id: userId });
    },
    onSuccess: async (_data, userId) => {
      toast.success('Unfollowed');
      if (currentUser) {
        setUser({
          ...currentUser,
          following: currentUser.following.filter((id) => id !== userId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['other-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to unfollow');
    },
  });

  const isFollowing = (userId: string) =>
    currentUser?.following?.includes(userId) ?? false;

  const filtered = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Join the Community</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Sign in to discover and connect with fellow learners.
          </p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Community</h1>
        <p className="text-sm text-muted-foreground">
          Connect with fellow learners on DeenVerse
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          className="pl-10 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* User list */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((person) => {
            const following = isFollowing(person._id);
            // Track per-user pending state using the mutation's variables
            const isThisUserMutating =
              (followMutation.isPending && followMutation.variables === person._id) ||
              (unfollowMutation.isPending && unfollowMutation.variables === person._id);

            return (
              <Card key={person._id} className="hover:bg-secondary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar
                    fallback={person.name}
                    src={person.avatar}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{person.username}
                    </p>
                    {person.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {person.bio}
                      </p>
                    )}
                  </div>
                  <Button
                    variant={following ? 'outline' : 'default'}
                    size="sm"
                    disabled={isThisUserMutating}
                    onClick={() =>
                      following
                        ? unfollowMutation.mutate(person._id)
                        : followMutation.mutate(person._id)
                    }
                    className="shrink-0 gap-1.5"
                  >
                    {following ? (
                      <>
                        <UserMinus className="h-3.5 w-3.5" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        Follow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered && filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search
                ? `No users matching "${search}"`
                : 'No other users found yet. Be the first to invite friends!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
