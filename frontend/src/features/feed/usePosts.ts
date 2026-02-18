import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Post, FeedResponse, TrendingHashtag } from '@/types/post';
import toast from 'react-hot-toast';

// ─── Feed (infinite scroll) ──────────────────────────────────────────────────

export function useFeed(tab: 'following' | 'trending' = 'following') {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', tab],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/posts/feed', {
        params: { page: pageParam, limit: 10, tab },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

// ─── Single post ─────────────────────────────────────────────────────────────

export function usePost(postId: string | undefined) {
  return useQuery<{ post: Post; replies: Post[] }>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId,
  });
}

// ─── User posts ──────────────────────────────────────────────────────────────

export function useUserPosts(username: string | undefined) {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['userPosts', username],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/posts/user/${username}`, {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!username,
  });
}

// ─── Create post ─────────────────────────────────────────────────────────────

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { content: string; hadithRef?: string; replyTo?: string }) => {
      const { data } = await api.post('/posts', body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (variables.replyTo) {
        queryClient.invalidateQueries({ queryKey: ['post', variables.replyTo] });
      }
      toast.success('Post shared!');
    },
    onError: () => toast.error('Failed to post. Try again.'),
  });
}

// ─── Delete post ─────────────────────────────────────────────────────────────

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.delete(`/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}

// ─── Like / Unlike ───────────────────────────────────────────────────────────

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async (postId: string) => {
      // Optimistic update on feed pages
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      queryClient.setQueriesData<{ pages: FeedResponse[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post._id === postId
                  ? {
                      ...post,
                      likeCount: post.likes.includes('me')
                        ? post.likeCount - 1
                        : post.likeCount + 1,
                    }
                  : post,
              ),
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// ─── Repost ──────────────────────────────────────────────────────────────────

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/repost`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// ─── Hashtag posts ───────────────────────────────────────────────────────────

export function useHashtagPosts(hashtag: string | undefined) {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['hashtag', hashtag],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/posts/hashtag/${hashtag}`, {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!hashtag,
  });
}

// ─── Trending hashtags ───────────────────────────────────────────────────────

export function useTrendingHashtags() {
  return useQuery<{ hashtags: TrendingHashtag[] }>({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const { data } = await api.get('/posts/trending/hashtags');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ─── Follow suggestions ─────────────────────────────────────────────────────

export function useFollowSuggestions() {
  return useQuery<{ suggestions: Array<{
    _id: string; name: string; username: string;
    avatar?: string; bio?: string; followerCount: number; mutualCount: number;
  }> }>({
    queryKey: ['follow-suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/user/suggestions');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Public profile ──────────────────────────────────────────────────────────

export function usePublicProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', username],
    queryFn: async () => {
      const { data } = await api.get(`/user/username/${username}`);
      return data.user;
    },
    enabled: !!username,
  });
}

// ─── Follow / Unfollow ──────────────────────────────────────────────────────

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
      const { data } = await api.post(`/user/${action}`, { id: userId });
      return data;
    },
    onSuccess: (_data, { action }) => {
      toast.success(action === 'follow' ? 'Followed!' : 'Unfollowed');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['follow-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Action failed. Try again.'),
  });
}
