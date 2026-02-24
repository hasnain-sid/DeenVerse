import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Sign, SignCategory, SignsResponse, CategoryCount } from './types';
import { fetchMockDailySign, fetchMockSigns } from './mockData';

// Cache for 1 hour — signs are stable content
const STALE_TIME = 1000 * 60 * 60;

// In dev mode, use mock data so the page works without a running backend.
// Switch to false (or remove the condition) to always call the real API.
const USE_MOCK = import.meta.env.DEV;

export function useDailySign() {
    return useQuery<Sign>({
        queryKey: ['signs', 'daily'],
        queryFn: async (): Promise<Sign> => {
            if (USE_MOCK) return fetchMockDailySign();
            const { data } = await api.get('/api/v1/signs/daily');
            return data.sign as Sign;
        },
        staleTime: STALE_TIME,
    });
}

export function useSigns(category: SignCategory | 'all' = 'all', page = 1) {
    return useQuery<SignsResponse>({
        queryKey: ['signs', { category, page }],
        queryFn: async (): Promise<SignsResponse> => {
            if (USE_MOCK) {
                const signs = await fetchMockSigns(category === 'all' ? undefined : category);
                const pageSize = 12;
                const total = signs.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const paginated = signs.slice((page - 1) * pageSize, page * pageSize);
                return { signs: paginated, total, page, totalPages };
            }
            const params: Record<string, string | number> = { page, limit: 12 };
            if (category !== 'all') params.category = category;
            const { data } = await api.get('/api/v1/signs', { params });
            return data as SignsResponse;
        },
        staleTime: STALE_TIME,
    });
}

export function useSignById(id: string) {
    return useQuery<Sign>({
        queryKey: ['signs', id],
        queryFn: async (): Promise<Sign> => {
            const { data } = await api.get(`/api/v1/signs/${id}`);
            return data.sign as Sign;
        },
        enabled: Boolean(id),
        staleTime: STALE_TIME,
    });
}

export function useSignCategories() {
    return useQuery<CategoryCount[]>({
        queryKey: ['signs', 'categories'],
        queryFn: async (): Promise<CategoryCount[]> => {
            if (USE_MOCK) {
                const { MOCK_SIGNS } = await import('./mockData');
                const counts: Record<string, number> = {};
                for (const s of MOCK_SIGNS) {
                    counts[s.category] = (counts[s.category] ?? 0) + 1;
                }
                return Object.entries(counts).map(([category, count]) => ({
                    category: category as SignCategory,
                    count,
                }));
            }
            const { data } = await api.get('/api/v1/signs/categories');
            return data.categories as CategoryCount[];
        },
        staleTime: STALE_TIME,
    });
}
