import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useTrendingHashtags } from '../../src/hooks/usePosts';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { formatCount } from '@deenverse/shared';

export default function ExploreScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: trending, isLoading } = useTrendingHashtags();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.foreground }]}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="search" size={18} color={c.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: c.foreground }]}
          placeholder="Search hadiths, users, tags..."
          placeholderTextColor={c.mutedForeground}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            if (search.trim()) {
              router.push(`/search?q=${encodeURIComponent(search)}` as any);
            }
          }}
          returnKeyType="search"
        />
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccess}>
        {[
          { icon: 'book-outline', label: 'Hadith', route: '/hadith' },
          { icon: 'people-outline', label: 'Community', route: '/community' },
          { icon: 'bookmark-outline', label: 'Saved', route: '/saved' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickCard, { backgroundColor: c.card }]}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon as any} size={24} color={c.primary} />
            <Text style={[styles.quickLabel, { color: c.foreground }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trending Hashtags */}
      <Text style={[styles.sectionTitle, { color: c.foreground }]}>
        Trending
      </Text>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={c.primary} />
      ) : (
        <FlatList
          data={trending?.hashtags ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.hashtagRow, { borderBottomColor: c.border }]}
              onPress={() => router.push(`/hashtag/${item._id}` as any)}
            >
              <Text style={[styles.hashtagIndex, { color: c.mutedForeground }]}>
                {index + 1}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hashtagName, { color: c.foreground }]}>
                  #{item._id}
                </Text>
                <Text style={[styles.hashtagCount, { color: c.mutedForeground }]}>
                  {formatCount(item.count)} posts
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: c.mutedForeground }}>No trending topics yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
  },
  quickAccess: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  quickLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  hashtagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  hashtagIndex: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    width: 24,
  },
  hashtagName: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  hashtagCount: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
