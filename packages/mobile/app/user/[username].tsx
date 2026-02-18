import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  usePublicProfile,
  useUserPosts,
  useFollow,
  useToggleLike,
} from '../../src/hooks/useDetailHooks';
import { PostCard } from '../../src/components/PostCard';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing, fontSize } from '../../src/theme';
import { formatCount } from '@deenverse/shared';
import type { Post, UserProfile } from '@deenverse/shared';

export default function UserProfileScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const currentUser = useAuthStore((s) => s.user);

  const { data: profile, isLoading: profileLoading } = usePublicProfile(username);
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(username);
  const followMutation = useFollow();
  const likeMutation = useToggleLike();

  const user = profile as UserProfile | undefined;
  const posts = postsData?.pages.flatMap((p) => p.posts) ?? [];
  const isOwnProfile = currentUser?._id === user?._id;

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        currentUserId={currentUser?._id}
        onPress={() => router.push(`/post/${item._id}`)}
        onLike={(id) => likeMutation.mutate(id)}
        onProfilePress={(u) => router.push(`/user/${u}`)}
      />
    ),
    [currentUser?._id],
  );

  if (profileLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.mutedForeground }}>User not found</Text>
      </View>
    );
  }

  const handleFollow = () => {
    followMutation.mutate({
      userId: user._id,
      action: user.isFollowing ? 'unfollow' : 'follow',
    });
  };

  const ProfileHeader = () => (
    <View style={styles.headerSection}>
      {/* Cover */}
      <View style={[styles.cover, { backgroundColor: c.primary + '20' }]} />

      {/* Profile info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarRow}>
          <Avatar uri={user.avatar} name={user.name} size={72} />
          {!isOwnProfile && (
            <Button
              title={user.isFollowing ? 'Following' : 'Follow'}
              variant={user.isFollowing ? 'outline' : 'primary'}
              size="sm"
              onPress={handleFollow}
              loading={followMutation.isPending}
            />
          )}
        </View>

        <Text style={[styles.name, { color: c.foreground }]}>{user.name}</Text>
        <Text style={[styles.username, { color: c.mutedForeground }]}>
          @{user.username}
        </Text>

        {user.bio ? (
          <Text style={[styles.bio, { color: c.foreground }]}>{user.bio}</Text>
        ) : null}

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={[styles.statNum, { color: c.foreground }]}>
              {formatCount(user.followerCount ?? user.followers?.length ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}> Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={[styles.statNum, { color: c.foreground }]}>
              {formatCount(user.followingCount ?? user.following?.length ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}> Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts divider */}
      <View style={[styles.postsHeader, { borderColor: c.border }]}>
        <Text style={[styles.postsTitle, { color: c.foreground }]}>Posts</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: c.background }}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderPost}
      ListHeaderComponent={ProfileHeader}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={{ color: c.mutedForeground }}>No posts yet</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={{ padding: spacing.xl }} color={c.primary} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerSection: {},
  cover: { height: 100 },
  profileInfo: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -36,
    marginBottom: spacing.md,
  },
  name: { fontSize: fontSize.xl, fontWeight: '800' },
  username: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  bio: { fontSize: fontSize.base, lineHeight: 22, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.sm },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statNum: { fontWeight: '800', fontSize: fontSize.base },
  statLabel: { fontSize: fontSize.sm },
  postsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  postsTitle: { fontSize: fontSize.base, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
});
