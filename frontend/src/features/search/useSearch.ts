import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/themeStore';
import api from '@/lib/api';
import type { HadithListItem, HadithCategory } from '@/features/hadith/useHadith';

const HADITH_API = 'https://hadeethenc.com/api/v1';

// ── Types ────────────────────────────────────────────

export interface HadithSearchResult extends HadithListItem {
  matchSnippet?: string;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: string[];
}

// ── Hadith Search ────────────────────────────────────
// The HadeethEnc API doesn't have a dedicated search endpoint, so we:
// 1. Fetch hadiths from multiple popular categories
// 2. Filter client-side by query
// This gives a good search experience for the content we already serve.
// In the future this could be backed by a server-side index.

const SEARCH_CATEGORY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export function useHadithSearch(query: string) {
  const language = useThemeStore((s) => s.hadithLanguage);
  const trimmed = query.trim().toLowerCase();

  return useQuery<HadithSearchResult[]>({
    queryKey: ['hadith-search', language, trimmed],
    queryFn: async () => {
      if (!trimmed) return [];

      // Fetch hadiths from multiple categories in parallel
      const promises = SEARCH_CATEGORY_IDS.map((catId) =>
        fetch(
          `${HADITH_API}/hadeeths/list/?language=${language}&category_id=${catId}&page=1&per_page=100`
        )
          .then((res) => (res.ok ? res.json() : { data: [] }))
          .then((json) => (json.data as HadithListItem[]) || [])
          .catch(() => [] as HadithListItem[])
      );

      const results = await Promise.all(promises);
      const allHadiths = results.flat();

      // Deduplicate by ID
      const seen = new Set<string>();
      const unique = allHadiths.filter((h) => {
        if (seen.has(h.id)) return false;
        seen.add(h.id);
        return true;
      });

      // Filter by query (search title and hadith text)
      const matches = unique.filter(
        (h) =>
          h.title?.toLowerCase().includes(trimmed) ||
          h.hadeeth?.toLowerCase().includes(trimmed)
      );

      // Add highlighted snippet
      return matches.slice(0, 30).map((h) => ({
        ...h,
        matchSnippet: getSnippet(h.hadeeth || h.title, trimmed),
      }));
    },
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 15 * 60 * 1000,
  });
}

// ── User Search ──────────────────────────────────────

export function useUserSearch(query: string) {
  const trimmed = query.trim();

  return useQuery<UserSearchResult[]>({
    queryKey: ['user-search', trimmed],
    queryFn: async () => {
      if (!trimmed) return [];
      const { data } = await api.get('/user/search', { params: { q: trimmed } });
      return data.users ?? [];
    },
    enabled: trimmed.length >= 2,
    staleTime: 60 * 1000,
  });
}

// ── Category Search ──────────────────────────────────

export function useCategorySearch(query: string) {
  const language = useThemeStore((s) => s.hadithLanguage);
  const trimmed = query.trim().toLowerCase();

  return useQuery<HadithCategory[]>({
    queryKey: ['category-search', language, trimmed],
    queryFn: async () => {
      if (!trimmed) return [];
      const res = await fetch(
        `${HADITH_API}/categories/roots/?language=${language}`
      );
      if (!res.ok) return [];
      const roots: HadithCategory[] = await res.json();
      return roots.filter((c) =>
        c.title.toLowerCase().includes(trimmed)
      );
    },
    enabled: trimmed.length >= 1,
    staleTime: 60 * 60 * 1000,
  });
}

// ── Helpers ──────────────────────────────────────────

function getSnippet(text: string, query: string, contextLen = 80): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text.slice(0, contextLen * 2) + (text.length > contextLen * 2 ? '…' : '');

  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet += '…';
  return snippet;
}
