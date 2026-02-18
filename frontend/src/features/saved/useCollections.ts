import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────

export interface HadithCollection {
  _id: string;
  name: string;
  description: string;
  emoji: string;
  hadithIds: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Queries ──────────────────────────────────────────

export function useCollections() {
  return useQuery<HadithCollection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get('/collections');
      return data.collections ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ── Mutations ────────────────────────────────────────

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string; emoji?: string }) => {
      const { data } = await api.post('/collections', body);
      return data.collection as HadithCollection;
    },
    onSuccess: (collection) => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`"${collection.name}" created`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create collection');
    },
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string;
      emoji?: string;
    }) => {
      const { data } = await api.put(`/collections/${id}`, body);
      return data.collection as HadithCollection;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update collection');
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/collections/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete collection');
    },
  });
}

export function useAddToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, hadithId }: { collectionId: string; hadithId: string }) => {
      const { data } = await api.post(`/collections/${collectionId}/hadiths`, { hadithId });
      return data.collection as HadithCollection;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Added to collection');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add to collection');
    },
  });
}

export function useRemoveFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, hadithId }: { collectionId: string; hadithId: string }) => {
      await api.delete(`/collections/${collectionId}/hadiths/${hadithId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Removed from collection');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove from collection');
    },
  });
}
