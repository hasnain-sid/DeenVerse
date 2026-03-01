import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ShareKind } from './types';
import type { SharedContent } from '@/types/post';

interface ShareConfigResponse {
  config: {
    supportsShareToFeed: boolean;
    modernOptions: string[];
    supportedKinds: ShareKind[];
    feedTemplate?: {
      titlePrefix: string;
      fallbackExcerpt: string;
      suggestedHashtags: string[];
    } | null;
  };
}

export function useShareConfig(kind: ShareKind) {
  return useQuery<ShareConfigResponse['config']>({
    queryKey: ['share-config', kind],
    queryFn: async () => {
      const { data } = await api.get<ShareConfigResponse>('/share/config', {
        params: { kind },
      });
      return data.config;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useShareToFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { content?: string; sharedContent: SharedContent }) => {
      const { data } = await api.post('/share/to-feed', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Shared to feed');
    },
    onError: () => {
      toast.error('Could not share to feed');
    },
  });
}
