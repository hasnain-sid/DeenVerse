import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { spacing, fontSize, borderRadius } from '../theme';
import { isArabic } from '@deenverse/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HadithCardProps {
  arabicText: string;
  translation: string;
  source: string;
  number?: number;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
}

export function HadithCard({
  arabicText,
  translation,
  source,
  number,
  onSave,
  onShare,
  isSaved,
}: HadithCardProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[styles.sourceBadge, { backgroundColor: c.primary + '15' }]}
        >
          <Text style={[styles.sourceText, { color: c.primary }]}>{source}</Text>
        </View>
        {number != null && (
          <Text style={[styles.number, { color: c.mutedForeground }]}>
            #{number}
          </Text>
        )}
      </View>

      {/* Arabic Text */}
      <Text
        style={[
          styles.arabic,
          {
            color: c.foreground,
            textAlign: 'right',
            writingDirection: 'rtl',
          },
        ]}
      >
        {arabicText}
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: c.border }]} />

      {/* Translation */}
      <Text
        style={[
          styles.translation,
          {
            color: c.mutedForeground,
            textAlign: isArabic(translation) ? 'right' : 'left',
          },
        ]}
      >
        {translation}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={onSave} style={styles.actionBtn}>
          <Text style={{ color: isSaved ? c.gold : c.mutedForeground, fontSize: 20 }}>
            {isSaved ? '★' : '☆'}
          </Text>
        </Pressable>
        <Pressable onPress={onShare} style={styles.actionBtn}>
          <Text style={{ color: c.mutedForeground, fontSize: 16 }}>↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sourceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sourceText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  number: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  arabic: {
    fontSize: 22,
    lineHeight: 38,
    fontFamily: 'Amiri',
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  translation: {
    fontSize: fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  actionBtn: {
    padding: spacing.sm,
  },
});
