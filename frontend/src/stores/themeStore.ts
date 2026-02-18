import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  arabicFont: string;
  hadithLanguage: string;

  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setArabicFont: (font: string) => void;
  setHadithLanguage: (lang: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 16,
      fontFamily: 'Inter',
      arabicFont: 'Amiri',
      hadithLanguage: 'en',

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setArabicFont: (arabicFont) => set({ arabicFont }),
      setHadithLanguage: (hadithLanguage) => set({ hadithLanguage }),
    }),
    {
      name: 'deenverse-theme',
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

// Initialize theme on load
const savedTheme = useThemeStore.getState().theme;
applyTheme(savedTheme);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (useThemeStore.getState().theme === 'system') {
    applyTheme('system');
  }
});
