import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/themeStore';

const HADITH_API = 'https://hadeethenc.com/api/v1/hadeeths';

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

/**
 * Fetch the list of hadiths (cached, fetched once)
 */
export function useHadithList(categoryId = 11) {
  const language = useThemeStore((s) => s.hadithLanguage);

  return useQuery<HadithListItem[]>({
    queryKey: ['hadith-list', language, categoryId],
    queryFn: async () => {
      const res = await fetch(
        `${HADITH_API}/list/?language=${language}&category_id=${categoryId}&page=1&per_page=200`
      );
      if (!res.ok) throw new Error('Failed to fetch hadith list');
      const data = await res.json();
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
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
        `${HADITH_API}/one/?language=${language}&id=${id}`
      );
      if (!res.ok) throw new Error('Failed to fetch hadith');
      return res.json();
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
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
