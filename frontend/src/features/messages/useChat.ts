import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface ConversationUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface MessageData {
  _id: string;
  conversation: string;
  sender: ConversationUser;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationData {
  _id: string;
  participants: ConversationUser[];
  lastMessage: MessageData | null;
  unreadCount: number;
  updatedAt: string;
}

export function useConversations() {
  return useQuery<{ conversations: ConversationData[]; total: number }>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/chat/conversations');
      return data;
    },
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery<{ messages: MessageData[]; total: number }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
      return data;
    },
    enabled: !!conversationId,
    refetchInterval: false,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post('/chat/conversations', { userId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useChatUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<{ count: number }>({
    queryKey: ['chat-unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/chat/unread-count');
      return data;
    },
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  });
}
