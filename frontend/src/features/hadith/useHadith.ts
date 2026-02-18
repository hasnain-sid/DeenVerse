import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/themeStore';

const HADITH_API = 'https://hadeethenc.com/api/v1';

// ── Types ────────────────────────────────────────────

export interface HadithCategory {
  id: string;
  title: string;
  hadeeths_count: string;
  parent_id: string | null;
}

export interface HadithListItem {
  id: string;
  title: string;
  hadeeth: string;
}

export interface HadithDetail {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation: string;
  hints: string[];
  categories: string[];
  reference: string;
  translations: string[];
}

// ── Category hooks ───────────────────────────────────

/**
 * Fetch root-level categories
 */
export function useRootCategories() {
  const language = useThemeStore((s) => s.hadithLanguage);

  return useQuery<HadithCategory[]>({
    queryKey: ['hadith-root-categories', language],
    queryFn: async () => {
      const res = await fetch(
        `${HADITH_API}/categories/roots/?language=${language}`
      );
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour — categories rarely change
    gcTime: 2 * 60 * 60 * 1000,
  });
}

/**
 * Fetch subcategories for a given parent category
 */
export function useSubCategories(categoryId: string | null) {
  const language = useThemeStore((s) => s.hadithLanguage);

  return useQuery<HadithCategory[]>({
    queryKey: ['hadith-subcategories', language, categoryId],
    queryFn: async () => {
      const res = await fetch(
        `${HADITH_API}/categories/list/?language=${language}&category_id=${categoryId}`
      );
      if (!res.ok) throw new Error('Failed to fetch subcategories');
      const all: HadithCategory[] = await res.json();
      // Filter only direct children of the given category
      return all.filter((c) => c.parent_id === categoryId);
    },
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}

// ── Hadith list / detail hooks ───────────────────────

/**
 * Fetch the list of hadiths for a category
 */
export function useHadithList(categoryId: string | number = 11, page = 1, perPage = 50) {
  const language = useThemeStore((s) => s.hadithLanguage);

  return useQuery<HadithListItem[]>({
    queryKey: ['hadith-list', language, String(categoryId), page],
    queryFn: async () => {
      const res = await fetch(
        `${HADITH_API}/hadeeths/list/?language=${language}&category_id=${categoryId}&page=${page}&per_page=${perPage}`
      );
      if (!res.ok) throw new Error('Failed to fetch hadith list');
      const data = await res.json();
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

/**
 * Fetch a single hadith detail
 */
export function useHadithDetail(id: string | null) {
  const language = useThemeStore((s) => s.hadithLanguage);

  return useQuery<HadithDetail>({
    queryKey: ['hadith-detail', id, language],
    queryFn: async () => {
      const res = await fetch(
        `${HADITH_API}/hadeeths/one/?language=${language}&id=${id}`
      );
      if (!res.ok) throw new Error('Failed to fetch hadith');
      return res.json();
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Language code to label mapping
 */
export const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  ar: 'Arabic',
  hi: 'Hindi',
  ur: 'Urdu',
  fr: 'French',
  es: 'Spanish',
  tr: 'Turkish',
  id: 'Indonesian',
  bn: 'Bengali',
};

/**
 * Emoji icons for root categories
 */
export const CATEGORY_EMOJI: Record<string, string> = {
  '1': '📖', // Quran
  '2': '📜', // Hadith Sciences
  '3': '🕌', // Creed
  '4': '⚖️', // Jurisprudence
  '5': '🤲', // Virtues & Manners
  '6': '📢', // Da'wah
  '7': '📚', // Seerah & History
};
