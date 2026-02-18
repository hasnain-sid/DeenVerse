import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { Avatar } from './ui/Avatar';
import { spacing, fontSize, borderRadius } from '../theme';
import { timeAgo, formatCount } from '@deenverse/shared';
import type { Post } from '@deenverse/shared';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPress?: () => void;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onReply?: (postId: string) => void;
  onProfilePress?: (username: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onPress,
  onLike,
  onRepost,
  onReply,
  onProfilePress,
}: PostCardProps) {
  const c = useThemeColors();
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isReposted = currentUserId ? post.reposts.includes(currentUserId) : false;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { borderBottomColor: c.border }]}
    >
      {/* Reply context */}
      {post.replyTo && (
        <View style={styles.replyContext}>
          <Ionicons name="return-down-forward" size={14} color={c.mutedForeground} />
          <Text style={[styles.replyText, { color: c.mutedForeground }]}>
            Replying to @{post.replyTo.author.username}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        {/* Avatar */}
        <TouchableOpacity onPress={() => onProfilePress?.(post.author.username)}>
          <Avatar
            uri={post.author.avatar}
            name={post.author.name}
            size={42}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => onProfilePress?.(post.author.username)}
              style={styles.headerLeft}
            >
              <Text
                style={[styles.name, { color: c.foreground }]}
                numberOfLines={1}
              >
                {post.author.name}
              </Text>
              <Text
                style={[styles.username, { color: c.mutedForeground }]}
                numberOfLines={1}
              >
                @{post.author.username}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.time, { color: c.mutedForeground }]}>
              {timeAgo(post.createdAt)}
            </Text>
          </View>

          {/* Body */}
          <Text style={[styles.body, { color: c.foreground }]}>
            {post.content}
          </Text>

          {/* Images */}
          {post.images.length > 0 && (
            <View style={styles.imageGrid}>
              {post.images.slice(0, 4).map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[
                    styles.postImage,
                    {
                      borderRadius: borderRadius.lg,
                      width: post.images.length === 1 ? '100%' : '48%',
                    },
                  ]}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <ActionButton
              icon="chatbubble-outline"
              count={post.replyCount}
              color={c.mutedForeground}
              onPress={() => onReply?.(post._id)}
            />
            <ActionButton
              icon={isReposted ? 'repeat' : 'repeat-outline'}
              count={post.repostCount}
              color={isReposted ? c.success : c.mutedForeground}
              onPress={() => onRepost?.(post._id)}
            />
            <ActionButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              count={post.likeCount}
              color={isLiked ? '#ef4444' : c.mutedForeground}
              onPress={() => onLike?.(post._id)}
            />
            <ActionButton
              icon="share-outline"
              color={c.mutedForeground}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ActionButton({
  icon,
  count,
  color,
  onPress,
}: {
  icon: string;
  count?: number;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={actionStyles.button}>
      <Ionicons name={icon as any} size={18} color={color} />
      {count != null && count > 0 && (
        <Text style={[actionStyles.count, { color }]}>
          {formatCount(count)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  replyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: 54,
  },
  replyText: {
    fontSize: fontSize.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: fontSize.base,
    flexShrink: 1,
  },
  username: {
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  time: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  postImage: {
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingRight: spacing['3xl'],
  },
});

const actionStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  count: {
    fontSize: fontSize.xs,
  },
});
