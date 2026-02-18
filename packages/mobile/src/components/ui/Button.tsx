import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { borderRadius, fontSize, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const c = useThemeColors();

  const bgColor = {
    primary: c.primary,
    outline: 'transparent',
    ghost: 'transparent',
    destructive: c.destructive,
  }[variant];

  const textColor = {
    primary: c.primaryForeground,
    outline: c.primary,
    ghost: c.foreground,
    destructive: c.destructiveForeground,
  }[variant];

  const borderColor = variant === 'outline' ? c.primary : 'transparent';

  const paddingV = { sm: spacing.sm, md: spacing.md, lg: spacing.lg }[size];
  const paddingH = { sm: spacing.md, md: spacing.xl, lg: spacing['2xl'] }[size];
  const fs = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, fontSize: fs }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
});
