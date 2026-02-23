import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  TopicsListResponse,
  TopicDetail,
  MoodsListResponse,
  MoodDetail,
  SearchResult,
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
