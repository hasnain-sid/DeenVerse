import { create } from 'zustand';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return Appearance.getColorScheme() ?? 'dark';
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  resolved: resolveTheme('system'),
  setMode: (mode) => set({ mode, resolved: resolveTheme(mode) }),
}));
