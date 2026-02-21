import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { LearningUnitType, DailyLearningContent } from './components/ReflectionSplitView';

/** Fetch today's daily learning content for the given unit type */
export function useDailyLearningContent(type: LearningUnitType) {
    return useQuery<DailyLearningContent>({
        queryKey: ['daily-learning', type],
        queryFn: async () => {
            const { data } = await api.get('/daily-learning', { params: { type } });
            return data;
        },
    });
}

interface SaveReflectionPayload {
    learningType: LearningUnitType;
    referenceId: string;
    reflectionText: string;
    title?: string;
    isPrivate?: boolean;
}

/** Save a reflection for the current daily learning */
export function useSaveReflection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SaveReflectionPayload) => {
            const { data } = await api.post('/daily-learning/reflection', payload);
            return data;
        },
        onSuccess: () => {
            toast.success('Reflection saved!');
            queryClient.invalidateQueries({ queryKey: ['daily-learning-history'] });
        },
        onError: () => {
            toast.error('Failed to save reflection. Please try again.');
        },
    });
}

/** Fetch user's past reflections, optionally filtered by learning type */
export function useLearningHistory(type?: LearningUnitType) {
    return useQuery({
        queryKey: ['daily-learning-history', type],
        queryFn: async () => {
            const { data } = await api.get('/daily-learning/reflections', {
                params: type ? { type } : {},
            });
            return data;
        },
    });
}
