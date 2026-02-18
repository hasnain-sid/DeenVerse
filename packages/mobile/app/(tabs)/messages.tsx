import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '../../src/hooks/useMessages';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { timeAgo, truncate } from '@deenverse/shared';
import { Ionicons } from '@expo/vector-icons';
import type { Conversation } from '@deenverse/shared';

export default function MessagesScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useConversations();

  const conversations = data?.conversations ?? [];

  const getOther = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== user?._id) ?? conv.participants[0];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color={c.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const other = getOther(item);
          return (
            <TouchableOpacity
              style={[styles.convRow, { borderBottomColor: c.border }]}
              onPress={() =>
                router.push(`/conversation/${item._id}` as any)
              }
              activeOpacity={0.7}
            >
              <Avatar uri={other.avatar} name={other.name} size={48} />
              <View style={styles.convInfo}>
                <View style={styles.convHeader}>
                  <Text
                    style={[styles.convName, { color: c.foreground }]}
                    numberOfLines={1}
                  >
                    {other.name}
                  </Text>
                  {item.lastMessage && (
                    <Text style={[styles.convTime, { color: c.mutedForeground }]}>
                      {timeAgo(item.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>
                {item.lastMessage && (
                  <Text
                    style={[styles.convPreview, { color: c.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.sender === user?._id ? 'You: ' : ''}
                    {truncate(item.lastMessage.content, 60)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={c.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={c.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>
                No messages yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.mutedForeground }]}>
                Start a conversation with someone from their profile
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  convInfo: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: fontSize.base,
    fontWeight: '700',
    flex: 1,
  },
  convTime: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  convPreview: {
    fontSize: fontSize.sm,
    marginTop: 2,
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
