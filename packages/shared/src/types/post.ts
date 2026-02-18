// ===== Post & Notification Types =====
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
  page: number;
  totalPages: number;
  total: number;
}

export interface TrendingHashtag {
  _id: string;
  count: number;
}
