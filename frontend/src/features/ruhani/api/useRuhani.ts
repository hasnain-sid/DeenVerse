import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ruhaniApi, SpiritualPracticePayload } from './ruhaniApi';
import toast from 'react-hot-toast';
import axios from 'axios';

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

            const message = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;

            toast.error(message || 'Failed to save reflection. Please try again.');
        },
    });
};

export const useRuhaniJournal = (page = 1, limit = 20, type?: string, enabled = true) => {
    return useQuery({
        queryKey: ['ruhani', 'journal', page, limit, type],
        queryFn: () => ruhaniApi.getJournal({ page, limit, type }),
        staleTime: 5 * 60 * 1000,
        enabled,
    });
};

export const useRuhaniStats = () => {
    return useQuery({
        queryKey: ['ruhani', 'stats'],
        queryFn: ruhaniApi.getStats,
        staleTime: 5 * 60 * 1000,
    });
};
