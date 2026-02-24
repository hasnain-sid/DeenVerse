import { api } from '@/lib/api';
import type { TafakkurTopic, TazkiaTrait, TadabburAyah, JournalResponse, RuhaniStats } from '../types';

export interface SpiritualPracticePayload {
    practiceType: 'tafakkur' | 'tadabbur' | 'tazkia';
    sourceRef: string;
    sourceTitle: string;
    reflectionText?: string;
    guidedAnswers?: { prompt: string; answer: string }[];
    habitChecks?: { habit: string; completed: boolean }[];
    traitRating?: number;
    isPrivate?: boolean;
}

export const ruhaniApi = {
    getTafakkurTopics: async (): Promise<TafakkurTopic[]> => {
        const { data } = await api.get<TafakkurTopic[]>('/ruhani/tafakkur/topics');
        return data;
    },
    getTodayTafakkurTopic: async (): Promise<TafakkurTopic> => {
        const { data } = await api.get<TafakkurTopic>('/ruhani/tafakkur/today');
        return data;
    },
    getTazkiaTraits: async (): Promise<TazkiaTrait[]> => {
        const { data } = await api.get<TazkiaTrait[]>('/ruhani/tazkia/traits');
        return data;
    },
    getTadabburAyahs: async (): Promise<TadabburAyah[]> => {
        const { data } = await api.get<TadabburAyah[]>('/ruhani/tadabbur/ayahs');
        return data;
    },
    getTodayTadabburAyah: async (): Promise<TadabburAyah> => {
        const { data } = await api.get<TadabburAyah>('/ruhani/tadabbur/today');
        return data;
    },
    getTadabburAyahByVerseKey: async (verseKey: string): Promise<TadabburAyah> => {
        const { data } = await api.get<TadabburAyah>(`/ruhani/tadabbur/ayah/${encodeURIComponent(verseKey)}`);
        return data;
    },
    savePractice: async (payload: SpiritualPracticePayload) => {
        const { data } = await api.post('/ruhani/practice', payload);
        return data;
    },
    getJournal: async (params: { page?: number; limit?: number; type?: string }): Promise<JournalResponse> => {
        const { data } = await api.get<JournalResponse>('/ruhani/journal', { params });
        return data;
    },
    getStats: async (): Promise<RuhaniStats> => {
        const { data } = await api.get<RuhaniStats>('/ruhani/stats');
        return data;
    },
};
