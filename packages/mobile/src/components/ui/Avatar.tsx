import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '../hooks/useThemeColors';
import { borderRadius, fontSize } from '../theme';
import { getInitials } from '@deenverse/shared';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showOnline?: boolean;
}

export function Avatar({ uri, name, size = 40, showOnline }: AvatarProps) {
  const c = useThemeColors();

  if (uri) {
    return (
      <View>
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          placeholder={require('../../assets/avatar-placeholder.png')}
          transition={200}
        />
        {showOnline && (
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: c.success, borderColor: c.background },
            ]}
          />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.accent,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { color: c.accentForeground, fontSize: size * 0.36 },
        ]}
      >
        {getInitials(name)}
      </Text>
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            { backgroundColor: c.success, borderColor: c.background },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e5e7eb',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
