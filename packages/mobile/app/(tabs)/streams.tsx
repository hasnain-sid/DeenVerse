import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { formatCount } from '@deenverse/shared';
import type { Stream } from '@deenverse/shared';

export default function StreamsScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<{ streams: Stream[] }>({
    queryKey: ['live-streams'],
    queryFn: async () => {
      const { data } = await api.get('/streams/live');
      return data;
    },
    refetchInterval: 15_000,
  });

  const streams = data?.streams ?? [];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.foreground }]}>Live Streams</Text>
      </View>

      <FlatList
        data={streams}
        keyExtractor={(item) => item._id}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={c.primary} />
        }
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.streamCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => router.push(`/stream/${item._id}`)}
            activeOpacity={0.8}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.thumbnail, { backgroundColor: c.accent }]}>
                  <Ionicons name="radio" size={40} color={c.mutedForeground} />
                </View>
              )}

              {/* LIVE badge */}
              {item.status === 'live' && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}

              {/* Viewer count */}
              <View style={styles.viewerBadge}>
                <Ionicons name="eye" size={12} color="#fff" />
                <Text style={styles.viewerText}>
                  {formatCount(item.viewerCount)}
                </Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.streamInfo}>
              <Avatar uri={item.host.avatar} name={item.host.name} size={36} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.streamTitle, { color: c.foreground }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={[styles.hostName, { color: c.mutedForeground }]}>
                  {item.host.name}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: c.accent }]}>
                  <Text style={[styles.categoryText, { color: c.mutedForeground }]}>
                    {item.category.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="radio-outline" size={48} color={c.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>
                No live streams
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.mutedForeground }]}>
                Check back later for live lectures and Q&A sessions
              </Text>
            </View>
          )
        }
      />
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
  streamCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  liveText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  viewerBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  viewerText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  streamInfo: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  streamTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  hostName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing['3xl'],
  },
});
