import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@deenverse/shared';

const TOKEN_KEY = 'deenverse_access_token';
const USER_KEY = 'deenverse_user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
  updateSaved: (hadithId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
    SecureStore.setItemAsync(TOKEN_KEY, accessToken).catch(() => {});
  },

  login: (user, accessToken) => {
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
    SecureStore.setItemAsync(TOKEN_KEY, accessToken).catch(() => {});
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateSaved: (hadithId) => {
    const { user } = get();
    if (!user) return;
    const saved = user.saved.includes(hadithId)
      ? user.saved.filter((id) => id !== hadithId)
      : [...user.saved, hadithId];
    set({ user: { ...user, saved } });
  },
}));
