// Shared types for Ruhani Hub feature

export interface TafakkurTopic {
    slug: string;
    title: string;
    arabicTitle: string;
    icon: string;
    theme: string;
    contemplate: string;
    quranRefs: string[];
    primaryVerseKey: string;
    guidedQuestions: string[];
    linkedTazkiaTraits: string[];
    linkedAyahKey?: string;
}

export interface TazkiaTrait {
    slug: string;
    title: string;
    arabicTitle: string;
    primaryAyah: string;
    primaryHadith: string;
    description: string;
    muhasabaPrompts: string[];
    actionTemplate: string;
}

export interface TadabburAyah {
    slug: string;
    verseKey: string;
    arabicText: string;
    translation: string;
    context: string;
    guidedQuestions: string[];
    linkedTraitSlug?: string;
    linkedTafakkurSlugs: string[];
    theme: string;
}

export interface SpiritualPracticeEntry {
    _id: string;
    userId: string;
    practiceType: 'tafakkur' | 'tadabbur' | 'tazkia';
    sourceRef: string;
    sourceTitle: string;
    reflectionText?: string;
    guidedAnswers?: { prompt: string; answer: string }[];
    habitChecks?: { habit: string; completed: boolean }[];
    traitRating?: number;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface JournalResponse {
    practices: SpiritualPracticeEntry[];
    totalPages: number;
    currentPage: number;
    totalEntries: number;
}

export interface RuhaniStats {
    tafakkur: number;
    tadabbur: number;
    tazkia: number;
    total: number;
}
