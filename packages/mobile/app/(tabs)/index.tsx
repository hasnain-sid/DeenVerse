import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFeed, useToggleLike, useToggleRepost } from '../../src/hooks/usePosts';
import { PostCard } from '../../src/components/PostCard';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '@deenverse/shared';

export default function HomeScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'following' | 'trending'>('following');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useFeed(tab);

  const likeMutation = useToggleLike();
  const repostMutation = useToggleRepost();

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        currentUserId={user?._id}
        onPress={() => router.push(`/post/${item._id}`)}
        onLike={(id) => likeMutation.mutate(id)}
        onRepost={(id) => repostMutation.mutate(id)}
        onReply={(id) => router.push(`/post/${id}`)}
        onProfilePress={(username) => router.push(`/user/${username}`)}
      />
    ),
    [user?._id],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.logo, { color: c.primary }]}>☪ DeenVerse</Text>
        <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color={c.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={[styles.tabs, { borderBottomColor: c.border }]}>
        {(['following', 'trending'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tab,
              tab === t && { borderBottomColor: c.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? c.foreground : c.mutedForeground },
              ]}
            >
              {t === 'following' ? 'Following' : 'Trending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>
                No posts yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.mutedForeground }]}>
                Follow users to see their posts here
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={{ paddingVertical: spacing.xl }}
              color={c.primary}
            />
          ) : null
        }
      />

      {/* FAB — Create Post */}
      <TouchableOpacity
        onPress={() => router.push('/create-post' as any)}
        style={[styles.fab, { backgroundColor: c.primary }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    fontSize: fontSize['xl'],
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
