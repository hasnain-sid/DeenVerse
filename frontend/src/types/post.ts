export interface SharedContent {
  kind: 'hadith' | 'ayah' | 'ruku' | 'juzz' | 'mood' | 'sign';
  title?: string;
  sourceRef?: string;
  sourceRoute?: string;
  excerpt?: string;
  arabic?: string;
  translation?: string;
  meta?: string[];
}

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  hadithRef?: string;
  sharedContent?: SharedContent | null;
  images: string[];
  likes: string[];
  reposts: string[];
  replyTo?: {
    _id: string;
    author: {
      _id: string;
      name: string;
      username: string;
    };
    content: string;
  } | null;
  replyCount: number;
  likeCount: number;
  repostCount: number;
  shareCount: number;
  views: number;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  type: 'like' | 'reply' | 'follow' | 'repost' | 'mention' | 'system';
  post?: {
    _id: string;
    content: string;
  } | null;
  read: boolean;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  /** Opaque cursor for the next page (null when no more pages). */
  nextCursor: string | null;
  /** Whether more pages exist. */
  hasMore: boolean;
  /** @deprecated Legacy page number — present only when `page` param is used. */
  page?: number;
  /** @deprecated Legacy total pages — present only when `page` param is used. */
  totalPages?: number;
  /** @deprecated Legacy total count — present only when `page` param is used. */
  total?: number;
  /** Observability metadata (development aid). */
  _meta?: {
    cacheHit?: boolean;
    queryTimeMs?: number;
    resultCount?: number;
    cursorUsed?: boolean;
  };
}

export interface TrendingHashtag {
  hashtag: string;
  count: number;
}
