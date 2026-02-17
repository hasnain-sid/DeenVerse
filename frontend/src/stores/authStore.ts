import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  login: (user: User, _accessToken?: string) => void;
  logout: () => void;
  updateSaved: (hadithId: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateSaved: (hadithId) => {
        const { user } = get();
        if (!user) return;

        const saved = user.saved.includes(hadithId)
          ? user.saved.filter((id) => id !== hadithId)
          : [...user.saved, hadithId];

        set({ user: { ...user, saved } });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'deenverse-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
