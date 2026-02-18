// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: import('./user').User;
  accessToken: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ===== Message / Conversation Types =====
export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  }>;
  lastMessage?: {
    _id: string;
    content: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}
