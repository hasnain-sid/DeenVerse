/** Lightweight topic item returned by the /topics list endpoint */
export interface TopicItem {
  slug: string;
  name: string;
  nameArabic: string;
  icon: string;
  description: string;
  category: string;
  ayahCount: number;
}

/** Full ayah object resolved from AlQuran Cloud */
export interface AyahItem {
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
  tafsir?: string | null;
  audioUrl?: string | null;
}

/** Lesson associated with a topic */
export interface TopicLesson {
  title: string;
  explanation: string;
  practicalActions: string[];
}

/** Full topic detail returned by /topics/:slug */
export interface TopicDetail {
  slug: string;
  name: string;
  nameArabic: string;
  icon: string;
  description: string;
  category: string;
  ayahs: AyahItem[];
  lessons: TopicLesson | null;
  ayahCount: number;

  // Phase 3 Extensions
  reflections?: Reflection[];
  learningProgress?: LearningProgress;
}

export interface Reflection {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  date: string;
  isScholarVerified: boolean;
  scholarName?: string;
  scholarNote?: string;
}

export interface LearningProgress {
  topicSlug?: string;
  lastReviewed: string | null;
  nextReviewDate: string | null;
  repetitionLevel: number;
  totalReviews?: number;
}

/** Paginated reflections response from the API */
export interface ReflectionsResponse {
  reflections: Reflection[];
  total: number;
  page: number;
  totalPages: number;
}

/** Lightweight mood item returned by the /moods list endpoint */
export interface MoodItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  relatedTopics: string[];
}

/** Related topic reference inside mood detail */
export interface RelatedTopic {
  slug: string;
  name: string;
  icon: string;
}

/** Lesson with topic context (used inside mood detail) */
export interface MoodLesson extends TopicLesson {
  topicSlug: string;
  topicName: string;
}

/** Full mood detail returned by /moods/:moodId */
export interface MoodDetail {
  id: string;
  name: string;
  emoji: string;
  description: string;
  relatedTopics: RelatedTopic[];
  ayahs: AyahItem[];
  lessons: MoodLesson[];
  ayahCount: number;
}

/** Search result item */
export interface SearchMatch {
  surahNumber: number;
  ayahNumber: number;
  globalAyahNumber: number;
  text: string;
  surahName: string;
  surahNameArabic: string;
  edition: string;
}

/** Search response */
export interface SearchResult {
  keyword: string;
  matches: SearchMatch[];
  count: number;
}

/** Topics list response */
export interface TopicsListResponse {
  topics: TopicItem[];
  categories: string[];
}

/** Moods list response */
export interface MoodsListResponse {
  moods: MoodItem[];
}
