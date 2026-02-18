import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { borderRadius, fontSize, spacing } from '../theme';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const c = useThemeColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: c.foreground }]}>{label}</Text>
      )}
      <RNTextInput
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={c.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: c.card,
            color: c.foreground,
            borderColor: error
              ? c.destructive
              : focused
                ? c.primary
                : c.border,
          },
          style,
        ]}
      />
      {error && (
        <Text style={[styles.error, { color: c.destructive }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
  },
  error: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
