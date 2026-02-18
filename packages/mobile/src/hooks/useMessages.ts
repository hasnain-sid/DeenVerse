import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Conversation, Message } from '@deenverse/shared';

export function useConversations() {
  return useQuery<{ conversations: Conversation[] }>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/chat/conversations');
      return data;
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery<{ messages: Message[] }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
      return data;
    },
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const { data } = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { content },
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['messages', vars.conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await api.post('/chat/conversations', {
        participantId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
