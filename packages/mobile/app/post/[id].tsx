import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePost, useToggleLike } from '../../src/hooks/useDetailHooks';
import { useCreatePost } from '../../src/hooks/usePosts';
import { PostCard } from '../../src/components/PostCard';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '@deenverse/shared';

export default function PostDetailScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = usePost(id);
  const likeMutation = useToggleLike();
  const replyMutation = useCreatePost();
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { content: replyText.trim(), replyTo: id },
      { onSuccess: () => setReplyText('') },
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!data?.post) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.mutedForeground }}>Post not found</Text>
      </View>
    );
  }

  const allPosts: Post[] = [data.post, ...(data.replies ?? [])];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={allPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <PostCard
            post={item}
            currentUserId={user?._id}
            onLike={(pid) => likeMutation.mutate(pid)}
            onProfilePress={(username) => router.push(`/user/${username}`)}
            onPress={index > 0 ? () => router.push(`/post/${item._id}`) : undefined}
          />
        )}
        ItemSeparatorComponent={() => (
          index === 0 ? (
            <View style={[styles.repliesHeader, { borderColor: c.border }]}>
              <Text style={[styles.repliesTitle, { color: c.foreground }]}>
                Replies ({data.replies?.length ?? 0})
              </Text>
            </View>
          ) : null
        )}
      />

      {/* Reply composer */}
      <View style={[styles.replyBar, { backgroundColor: c.card, borderTopColor: c.border }]}>
        <TextInput
          style={[styles.replyInput, { color: c.foreground, backgroundColor: c.background }]}
          placeholder="Write a reply..."
          placeholderTextColor={c.mutedForeground}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleReply}
          disabled={!replyText.trim() || replyMutation.isPending}
          style={[styles.sendBtn, { backgroundColor: c.primary, opacity: replyText.trim() ? 1 : 0.4 }]}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Workaround: define index outside render for the separator
let index = 0;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repliesHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  repliesTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
