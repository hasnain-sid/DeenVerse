export type SignCategory =
    | 'quran_science'
    | 'prophecy'
    | 'linguistic_miracle'
    | 'historical_fact'
    | 'prophetic_wisdom'
    | 'names_of_allah';

export interface Sign {
    _id: string;
    category: SignCategory;
    title: string;
    summary: string; // Short (card preview) — matches backend model field name
    explanation: string; // Long (detail view)
    reference: string;
    arabicText?: string | null;
    translation?: string | null;
    sourceUrl: string;
    mediaUrl?: string;
    order: number;
    tags: string[];
    createdAt: string;
}

export interface SignsResponse {
    signs: Sign[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CategoryCount {
    category: SignCategory;
    count: number;
}
