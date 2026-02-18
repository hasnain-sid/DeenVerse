import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Post, UserProfile } from '@deenverse/shared';

// Re-export the existing hooks from usePosts.ts and add the missing ones

/* ────────── Single post with replies ────────── */
export function usePost(postId: string) {
  return useQuery<{ post: Post; replies: Post[] }>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId,
  });
}

/* ────────── Public user profile ────────── */
export function usePublicProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: ['user', username],
    queryFn: async () => {
      const { data } = await api.get(`/user/profile/${username}`);
      return data.user;
    },
    enabled: !!username,
  });
}

/* ────────── User's posts (paginated) ────────── */
export function useUserPosts(username: string) {
  return useInfiniteQuery<{ posts: Post[]; hasMore: boolean }>({
    queryKey: ['userPosts', username],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/posts/user/${username}`, {
        params: { page: pageParam, limit: 15 },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (last, _, lastPageParam) =>
      last.hasMore ? (lastPageParam as number) + 1 : undefined,
    enabled: !!username,
  });
}

/* ────────── Follow / Unfollow ────────── */
export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
      const { data } = await api.post(`/user/${userId}/follow`);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['user'] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

/* ────────── Toggle like (re-export for detail screens) ────────── */
export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['post'] });
      qc.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}
