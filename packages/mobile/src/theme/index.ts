// DeenVerse Mobile — Islamic Design Theme
// Matches the web app's Notion-inspired light/dark system

export const colors = {
  light: {
    primary: '#10b981',
    primaryForeground: '#ffffff',
    background: '#ffffff',
    foreground: '#0f1419',
    card: '#f7f9f9',
    cardForeground: '#0f1419',
    border: '#eff3f4',
    muted: '#f7f9f9',
    mutedForeground: '#536471',
    accent: '#eff3f4',
    accentForeground: '#0f1419',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    gold: '#d4a056',
  },
  dark: {
    primary: '#10b981',
    primaryForeground: '#ffffff',
    background: '#000000',
    foreground: '#e7e9ea',
    card: '#16181c',
    cardForeground: '#e7e9ea',
    border: '#2f3336',
    muted: '#16181c',
    mutedForeground: '#71767b',
    accent: '#2f3336',
    accentForeground: '#e7e9ea',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    gold: '#d4a056',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type ThemeColors = typeof colors.light;
