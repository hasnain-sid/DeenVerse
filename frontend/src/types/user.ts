// ===== User Types =====
export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  saved: string[];
  followers: string[];
  following: string[];
  role?: 'user' | 'scholar' | 'admin' | 'moderator';
  verified?: boolean;
  streakGoal?: number;
  banned?: boolean;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    plan: 'student' | 'premium';
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  };
}

export interface UserProfile extends User {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}
