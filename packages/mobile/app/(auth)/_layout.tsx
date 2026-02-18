import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function AuthLayout() {
  const c = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
