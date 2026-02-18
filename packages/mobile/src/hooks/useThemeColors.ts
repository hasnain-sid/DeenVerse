import React from 'react';
import { useThemeStore } from '../stores/themeStore';
import { colors, type ThemeColors } from '../theme';

/** Returns the resolved theme colors based on current mode */
export function useThemeColors(): ThemeColors {
  const resolved = useThemeStore((s) => s.resolved);
  return colors[resolved];
}

/** Returns 'light' | 'dark' */
export function useColorScheme(): 'light' | 'dark' {
  return useThemeStore((s) => s.resolved);
}
