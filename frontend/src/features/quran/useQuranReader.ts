import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AyahResponse, RukuResponse, JuzResponse, SurahInfo } from './quranTypes';

/** Fetch a single ayah by global number (1–6236) */
export function useAyah(globalNumber: number, enabled = true) {
    return useQuery<AyahResponse>({
        queryKey: ['quran', 'ayah', globalNumber],
        queryFn: async () => {
            const { data } = await api.get(`/quran/ayah/${globalNumber}`);
            return data;
        },
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days — Quran text is immutable
        enabled: enabled && globalNumber >= 1 && globalNumber <= 6236,
    });
}

/** Fetch a complete ruku by number (1–556) */
export function useRuku(rukuNumber: number, enabled = true) {
    return useQuery<RukuResponse>({
        queryKey: ['quran', 'ruku', rukuNumber],
        queryFn: async () => {
            const { data } = await api.get(`/quran/ruku/${rukuNumber}`);
            return data;
        },
        staleTime: 7 * 24 * 60 * 60 * 1000,
        enabled: enabled && rukuNumber >= 1 && rukuNumber <= 556,
    });
}

/** Fetch a complete juzz by number (1–30) */
export function useJuz(juzNumber: number, enabled = true) {
    return useQuery<JuzResponse>({
        queryKey: ['quran', 'juz', juzNumber],
        queryFn: async () => {
            const { data } = await api.get(`/quran/juz/${juzNumber}`);
            return data;
        },
        staleTime: 7 * 24 * 60 * 60 * 1000,
        enabled: enabled && juzNumber >= 1 && juzNumber <= 30,
    });
}

/** Fetch the static surah index (114 entries) — served from quran-meta, effectively immutable */
export function useSurahs() {
    return useQuery<SurahInfo[]>({
        queryKey: ['quran', 'surahs'],
        queryFn: async () => {
            const { data } = await api.get('/quran/surahs');
            return data.surahs;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
