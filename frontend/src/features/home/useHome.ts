import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { HadithCollection } from '@/features/saved/useCollections';
import type { DailyLearningContent } from '@/features/daily-learning/components/ReflectionSplitView';

// ─── Daily Learning (public, no auth) ────────────────

export function useDailyLearningHome() {
  return useQuery<DailyLearningContent>({
    queryKey: ['daily-learning', 'ayah'],
    queryFn: async () => {
      const { data } = await api.get('/daily-learning', { params: { type: 'ayah' } });
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ─── Streak (auth required) ─────────────────────────

interface StreakData {
  current: number;
  goal: number;
  longest: number;
  activeDaysThisWeek: number;
}

export function useStreak(enabled: boolean) {
  return useQuery<StreakData>({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const { data } = await api.get('/user/streak');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Recent Collections (auth required) ─────────────

export function useRecentCollections(enabled: boolean) {
  return useQuery<HadithCollection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get('/collections');
      return data.collections ?? [];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Recent Daily Learning History (auth required) ──

interface LearningEntry {
  _id: string;
  learningType: string;
  referenceId: string;
  title?: string;
  reflectionText?: string;
  isCompleted: boolean;
  createdAt: string;
}

export function useRecentLearning(enabled: boolean) {
  return useQuery<LearningEntry[]>({
    queryKey: ['daily-learning-history-recent'],
    queryFn: async () => {
      const { data } = await api.get('/daily-learning/reflections');
      // Backend returns { success, reflections } — unwrap the array
      const list = (data.reflections ?? data) as LearningEntry[];
      return list.slice(0, 3);
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Live Stream (public, no auth) ──────────────────

interface LiveStream {
  _id: string;
  title: string;
  host: { name: string; username: string; avatar?: string };
  viewerCount: number;
  status: string;
  category?: string;
}

export function useLiveStream() {
  return useQuery<LiveStream | null>({
    queryKey: ['home-featured-stream'],
    queryFn: async () => {
      const { data } = await api.get('/streams/live', { params: { limit: 1 } });
      return data.streams?.[0] ?? null;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ─── Home Stats (auth required) ─────────────────────

interface HomeStats {
  versesLearned: number;
  activeCourses: number;
}

export function useHomeStats(enabled: boolean) {
  return useQuery<HomeStats>({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const { data } = await api.get('/user/home-stats');
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
