import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ruhaniApi,
    SpiritualPracticePayload,
    UpdatePracticePayload,
    SessionUpdatePayload,
} from './ruhaniApi';
import toast from 'react-hot-toast';
import axios from 'axios';

/** Pulls the server's error message out of an axios error, if there is one. */
function extractMessage(error: unknown): string | undefined {
    return axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
}

export const useRuhaniTopics = () => {
    return useQuery({
        queryKey: ['ruhani', 'tafakkur', 'topics'],
        queryFn: ruhaniApi.getTafakkurTopics,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
};

export const useTodayTafakkurTopic = () => {
    return useQuery({
        queryKey: ['ruhani', 'tafakkur', 'today'],
        queryFn: ruhaniApi.getTodayTafakkurTopic,
        staleTime: 60 * 60 * 1000,
    });
};

export const useTazkiaTraits = () => {
    return useQuery({
        queryKey: ['ruhani', 'tazkia', 'traits'],
        queryFn: ruhaniApi.getTazkiaTraits,
        staleTime: 60 * 60 * 1000,
    });
};

export const useTadabburAyahs = () => {
    return useQuery({
        queryKey: ['ruhani', 'tadabbur', 'ayahs'],
        queryFn: ruhaniApi.getTadabburAyahs,
        staleTime: 60 * 60 * 1000,
    });
};

export const useTodayTadabburAyah = () => {
    return useQuery({
        queryKey: ['ruhani', 'tadabbur', 'today'],
        queryFn: ruhaniApi.getTodayTadabburAyah,
        staleTime: 60 * 60 * 1000,
    });
};

export const useTadabburAyahByVerseKey = (verseKey: string | undefined) => {
    return useQuery({
        queryKey: ['ruhani', 'tadabbur', 'ayah', verseKey],
        queryFn: () => ruhaniApi.getTadabburAyahByVerseKey(verseKey!),
        staleTime: 60 * 60 * 1000,
        enabled: !!verseKey,
    });
};

export const useSavePractice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SpiritualPracticePayload) => ruhaniApi.savePractice(payload),
        onSuccess: () => {
            // Invalidate journal cache so new entries show up
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'journal'] });
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'stats'] });
            toast.success('Reflection saved successfully');
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error('Please log in to save reflections.');
                return;
            }

            toast.error(extractMessage(error) || 'Failed to save reflection. Please try again.');
        },
    });
};

export const useUpdatePractice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePracticePayload }) =>
            ruhaniApi.updatePractice(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'journal'] });
            toast.success('Reflection updated');
        },
        onError: (error) => {
            toast.error(extractMessage(error) || 'Failed to update reflection. Please try again.');
        },
    });
};

export const useDeletePractice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ruhaniApi.deletePractice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'journal'] });
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'stats'] });
            toast.success('Reflection deleted');
        },
        onError: (error) => {
            toast.error(extractMessage(error) || 'Failed to delete reflection. Please try again.');
        },
    });
};

export const useExportJournal = () => {
    return useMutation({
        mutationFn: () => ruhaniApi.exportJournal(),
        onSuccess: () => toast.success('Journal downloaded'),
        onError: () => toast.error('Failed to export journal. Please try again.'),
    });
};

export const useRuhaniJournal = (page = 1, limit = 20, type?: string, enabled = true, q?: string) => {
    return useQuery({
        queryKey: ['ruhani', 'journal', page, limit, type, q],
        queryFn: () => ruhaniApi.getJournal({ page, limit, type, q }),
        staleTime: 5 * 60 * 1000,
        enabled,
        placeholderData: (previous) => previous, // keeps results steady while typing
    });
};

export const useStartSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (duration: number | null) => ruhaniApi.startSession(duration),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'sessions'] });
        },
        onError: (error) => {
            toast.error(extractMessage(error) || 'Could not start the session. Please try again.');
        },
    });
};

export const useUpdateSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: SessionUpdatePayload }) =>
            ruhaniApi.updateSession(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ruhani', 'sessions'] });
        },
        // Session bookkeeping failing should not interrupt a practice in progress —
        // the user's reflections are already saved independently.
        onError: () => { /* silent by design */ },
    });
};

export const useRuhaniStats = (enabled = true) => {
    return useQuery({
        queryKey: ['ruhani', 'stats'],
        queryFn: ruhaniApi.getStats,
        staleTime: 5 * 60 * 1000,
        enabled,
    });
};
