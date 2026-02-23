/** Shared TypeScript types for Quran API responses */

export interface AyahResponse {
    referenceId: string;
    arabic: string;
    translation: string;
    surah: string;
    surahArabic: string;
    surahNumber: number;
    ayahNumber: number;
    globalAyahNumber: number;
    juzNumber: number;
    page: number;
    revelationType: string;
}

export interface AyahEntry {
    ayahNumber: number;
    globalAyahNumber: number;
    arabic: string;
    translation: string;
    surahNumber: number;
    surah: string;
    surahArabic: string;
    juzNumber: number;
    page: number;
}

export interface RukuResponse {
    referenceId: string;
    rukuNumber: number;
    arabic: string;
    translation: string;
    ayahs: AyahEntry[];
    surah: string;
    surahArabic: string;
    surahNumber: number;
    startingAyah: number;
    totalAyahsInRuku: number;
    juzNumber: number;
    revelationType: string;
}

export interface JuzResponse {
    referenceId: string;
    juzNumber: number;
    arabic: string;
    translation: string;
    ayahs: AyahEntry[];
    surah: string;
    surahsIncluded: string[];
    startingSurah: string;
    startingAyah: number;
    endingSurah: string;
    endingAyah: number;
    totalAyahsInJuz: number;
}
