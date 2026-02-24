import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  TopicsListResponse,
  TopicDetail,
  MoodsListResponse,
  MoodDetail,
  SearchResult,
  ReflectionsResponse,
  Reflection,
  LearningProgress,
} from './types';

/** Fetch the full topic catalogue with categories. */
export function useTopics() {
  return useQuery<TopicsListResponse>({
    queryKey: ['quran-topics'],
    queryFn: async () => {
      const { data } = await api.get('/quran-topics/topics');
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 min — static data
  });
}

/** Fetch a single topic with resolved ayahs. */
export function useTopicDetail(slug: string | undefined) {
  return useQuery<TopicDetail>({
    queryKey: ['quran-topic', slug],
    queryFn: async () => {
      const { data } = await api.get(`/quran-topics/topics/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  });
}

/** Fetch all moods. */
export function useMoods() {
  return useQuery<MoodsListResponse>({
    queryKey: ['quran-moods'],
    queryFn: async () => {
      const { data } = await api.get('/quran-topics/moods');
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
}

/** Fetch a mood detail with resolved ayahs. */
export function useMoodDetail(moodId: string | undefined) {
  return useQuery<MoodDetail>({
    queryKey: ['quran-mood', moodId],
    queryFn: async () => {
      const { data } = await api.get(`/quran-topics/moods/${moodId}`);
      return data;
    },
    enabled: !!moodId,
    staleTime: 30 * 60 * 1000,
  });
}

/** Search the Quran by keyword. */
export function useQuranSearch(keyword: string) {
  const trimmed = keyword.trim();
  return useQuery<SearchResult>({
    queryKey: ['quran-search', trimmed],
    queryFn: async () => {
      const { data } = await api.get('/quran-topics/search', {
        params: { q: trimmed },
      });
      return data;
    },
    enabled: trimmed.length >= 2,
    staleTime: 30 * 60 * 1000,
  });
}

// ── Phase 3: Community Reflections ──────────────────────

/** Fetch paginated reflections for a topic. */
export function useTopicReflections(slug: string | undefined, page = 1) {
  return useQuery<ReflectionsResponse>({
    queryKey: ['quran-topic-reflections', slug, page],
    queryFn: async () => {
      const { data } = await api.get(`/quran-topics/topics/${slug}/reflections`, {
        params: { page },
      });
      return data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000, // 1 min — reflections are dynamic
  });
}

/** Create a reflection on a topic. */
export function useCreateReflection(slug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; reflection: Reflection }, Error, string>({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/quran-topics/topics/${slug}/reflections`, {
        content,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran-topic-reflections', slug] });
    },
  });
}

/** Toggle like on a reflection. */
export function useLikeReflection(slug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; liked: boolean; likeCount: number }, Error, string>({
    mutationFn: async (reflectionId: string) => {
      const { data } = await api.post(`/quran-topics/reflections/${reflectionId}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran-topic-reflections', slug] });
    },
  });
}

/** Delete a reflection. */
export function useDeleteReflection(slug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (reflectionId: string) => {
      const { data } = await api.delete(`/quran-topics/reflections/${reflectionId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran-topic-reflections', slug] });
    },
  });
}

// ── Phase 3: Spaced Repetition / Learning Progress ──────

/** Fetch learning progress for a specific topic (auth required). */
export function useTopicProgress(slug: string | undefined) {
  return useQuery<{ success: boolean; progress: LearningProgress | null }>({
    queryKey: ['quran-topic-progress', slug],
    queryFn: async () => {
      const { data } = await api.get(`/quran-topics/topics/${slug}/progress`);
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch all topics due for spaced repetition review. */
export function useDueReviews() {
  return useQuery<{ success: boolean; dueReviews: LearningProgress[] }>({
    queryKey: ['quran-topic-due-reviews'],
    queryFn: async () => {
      const { data } = await api.get('/quran-topics/progress/due');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Record a review session for spaced repetition. */
export function useRecordReview(slug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; progress: LearningProgress }, Error, number>({
    mutationFn: async (quality: number) => {
      const { data } = await api.post(`/quran-topics/topics/${slug}/progress`, {
        quality,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran-topic-progress', slug] });
      queryClient.invalidateQueries({ queryKey: ['quran-topic-due-reviews'] });
    },
  });
}
