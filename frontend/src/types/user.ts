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
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}
