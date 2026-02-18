import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Notification } from '@/types/post';

export function useNotifications(page = 1) {
  return useQuery<{ notifications: Notification[]; total: number; page: number; totalPages: number }>({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page, limit: 20 } });
      return data;
    },
  });
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data;
    },
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.setQueryData(['notifications-unread-count'], { count: 0 });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
