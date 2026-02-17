// ===== Hadith Types =====
export interface Hadith {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation: string;
  hints: string[];
  categories: string[];
  reference: string;
}

export interface HadithListItem {
  id: string;
  title: string;
  hadeeth: string;
}

export interface HadithFilters {
  language: string;
  categoryId: number;
  page: number;
  perPage: number;
}
