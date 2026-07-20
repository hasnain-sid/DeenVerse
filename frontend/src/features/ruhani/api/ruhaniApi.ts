import api from '@/lib/api';
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
    /** Chains this practice to the previous step of a spiral session. */
    linkedPracticeId?: string;
}

/**
 * Editable fields only. practiceType/sourceRef/sourceTitle identify what was
 * contemplated and are rejected server-side.
 */
export type UpdatePracticePayload = Partial<
    Pick<SpiritualPracticePayload, 'reflectionText' | 'guidedAnswers' | 'habitChecks' | 'traitRating' | 'isPrivate'>
>;

export interface SessionSuggestion {
    topic: TafakkurTopic;
    ayah: TadabburAyah;
    trait: TazkiaTrait;
    revisitingTrait: boolean;
}

export interface SpiritualSession {
    _id: string;
    duration: number | null;
    status: 'in-progress' | 'completed' | 'abandoned';
    topicSlug: string;
    verseKey: string;
    traitSlug: string;
    tafakkurPracticeId: string | null;
    tadabburPracticeId: string | null;
    tazkiaPracticeId: string | null;
    sessionAction?: string;
    completedAt: string | null;
    createdAt: string;
}

export interface SessionUpdatePayload {
    step?: 'tafakkur' | 'tadabbur' | 'tazkia';
    practiceId?: string;
    status?: 'in-progress' | 'completed' | 'abandoned';
    sessionAction?: string;
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
    updatePractice: async (id: string, payload: UpdatePracticePayload) => {
        const { data } = await api.patch(`/ruhani/practices/${id}`, payload);
        return data;
    },
    deletePractice: async (id: string) => {
        const { data } = await api.delete<{ deleted: boolean; id: string }>(`/ruhani/practices/${id}`);
        return data;
    },
    /** Downloads the user's full journal as a JSON file. */
    exportJournal: async () => {
        const response = await api.get('/ruhani/journal/export', { responseType: 'blob' });

        const url = URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ruhani-journal-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },
    getJournal: async (params: { page?: number; limit?: number; type?: string; q?: string }): Promise<JournalResponse> => {
        const { data } = await api.get<JournalResponse>('/ruhani/journal', { params });
        return data;
    },
    getStats: async (): Promise<RuhaniStats> => {
        const { data } = await api.get<RuhaniStats>('/ruhani/stats');
        return data;
    },

    // ── Guided sessions ──────────────────────────────────────────
    startSession: async (duration: number | null): Promise<{ session: SpiritualSession } & SessionSuggestion> => {
        const { data } = await api.post('/ruhani/session', { duration });
        return data;
    },
    updateSession: async (id: string, payload: SessionUpdatePayload): Promise<SpiritualSession> => {
        const { data } = await api.put<SpiritualSession>(`/ruhani/session/${id}`, payload);
        return data;
    },
};
