import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { FeedResponse, Post, TrendingHashtag } from '@deenverse/shared';
import { Alert } from 'react-native';

// ─── Feed (infinite scroll) ──────────────────────────
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

// ─── Single post ─────────────────────────────────────
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

// ─── User posts ──────────────────────────────────────
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

// ─── Create post ─────────────────────────────────────
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      content: string;
      hadithRef?: string;
      replyTo?: string;
      images?: string[];
    }) => {
      const { data } = await api.post('/posts', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => Alert.alert('Error', 'Failed to post. Try again.'),
  });
}

// ─── Like / Unlike ───────────────────────────────────
export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data;
    },
    onMutate: async (postId: string) => {
      await qc.cancelQueries({ queryKey: ['feed'] });
      const userId = useAuthStore.getState().user?._id ?? '';

      qc.setQueriesData<{ pages: FeedResponse[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post._id !== postId) return post;
                const liked = post.likes.includes(userId);
                return {
                  ...post,
                  likes: liked
                    ? post.likes.filter((id) => id !== userId)
                    : [...post.likes, userId],
                  likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
                };
              }),
            })),
          };
        },
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

// ─── Repost ──────────────────────────────────────────
export function useToggleRepost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/repost`);
      return data;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

// ─── Trending hashtags ───────────────────────────────
export function useTrendingHashtags() {
  return useQuery<{ hashtags: TrendingHashtag[] }>({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const { data } = await api.get('/posts/trending/hashtags');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Follow / Unfollow ──────────────────────────────
export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: 'follow' | 'unfollow';
    }) => {
      const { data } = await api.post(`/user/${action}`, { id: userId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// ─── Public profile ──────────────────────────────────
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
