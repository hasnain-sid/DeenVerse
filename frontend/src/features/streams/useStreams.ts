import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Stream } from '@/types/stream';
import toast from 'react-hot-toast';

// ─── Live streams ────────────────────────────────────────────────────────

export function useLiveStreams(category?: string) {
  return useQuery<{ streams: Stream[]; total: number }>({
    queryKey: ['streams', 'live', category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const { data } = await api.get('/streams/live', { params });
      return data;
    },
    refetchInterval: 15_000, // Refresh live list every 15s
  });
}

// ─── Scheduled streams ──────────────────────────────────────────────────

export function useScheduledStreams() {
  return useQuery<{ streams: Stream[]; total: number }>({
    queryKey: ['streams', 'scheduled'],
    queryFn: async () => {
      const { data } = await api.get('/streams/scheduled');
      return data;
    },
  });
}

// ─── Recorded streams (VOD) ─────────────────────────────────────────────

export function useRecordings() {
  return useQuery<{ streams: Stream[]; total: number }>({
    queryKey: ['streams', 'recordings'],
    queryFn: async () => {
      const { data } = await api.get('/streams/recordings');
      return data;
    },
  });
}

// ─── Single stream ──────────────────────────────────────────────────────

export function useStream(streamId: string | undefined) {
  return useQuery<{ stream: Stream }>({
    queryKey: ['stream', streamId],
    queryFn: async () => {
      const { data } = await api.get(`/streams/${streamId}`);
      return data;
    },
    enabled: !!streamId,
    refetchInterval: 10_000, // Keep viewer count fresh
  });
}

// ─── Create stream ──────────────────────────────────────────────────────

export function useCreateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      title: string;
      description?: string;
      category?: string;
      scheduledFor?: string;
    }) => {
      const { data } = await api.post('/streams', body);
      return data as { stream: Stream };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream created!');
    },
    onError: () => toast.error('Failed to create stream'),
  });
}

// ─── Start stream (go live) ─────────────────────────────────────────────

export function useStartStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data } = await api.patch(`/streams/${streamId}/start`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('You are now live! 🔴');
    },
    onError: () => toast.error('Failed to start stream'),
  });
}

// ─── End stream ─────────────────────────────────────────────────────────

export function useEndStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data } = await api.patch(`/streams/${streamId}/end`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream ended');
    },
    onError: () => toast.error('Failed to end stream'),
  });
}

// ─── My streams ─────────────────────────────────────────────────────────

export function useMyStreams() {
  return useQuery<{ streams: Stream[]; total: number }>({
    queryKey: ['streams', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/streams/me/streams');
      return data;
    },
  });
}
