import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateSaved: (hadithId: string) => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateSaved: (hadithId) => {
        const { user } = get();
        if (!user) return;

        const saved = user.saved.includes(String(hadithId))
          ? user.saved.filter((id) => id !== String(hadithId))
          : [...user.saved, String(hadithId)];

        set({ user: { ...user, saved } });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'deenverse-auth',
      // Only persist user & isAuthenticated — NOT the accessToken (stays in memory)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
