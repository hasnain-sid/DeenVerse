import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../../src/lib/api';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Avatar } from '../../src/components/ui/Avatar';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { formatCount, timeAgo } from '@deenverse/shared';
import type { Stream, StreamChatMessage } from '@deenverse/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StreamViewScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: stream, isLoading } = useQuery<{ stream: Stream }>({
    queryKey: ['stream', id],
    queryFn: async () => {
      const { data } = await api.get(`/streams/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const [chatMessages, setChatMessages] = useState<StreamChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef<FlatList>(null);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!stream?.stream) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <Text style={{ color: '#fff' }}>Stream not found</Text>
      </View>
    );
  }

  const s = stream.stream;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Video Player */}
      <View style={styles.playerContainer}>
        {s.playbackUrl ? (
          <Video
            source={{ uri: s.playbackUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
          />
        ) : (
          <View style={[styles.video, styles.noStream]}>
            <Ionicons name="radio" size={48} color="#666" />
            <Text style={{ color: '#666', marginTop: 8 }}>
              {s.status === 'scheduled' ? 'Stream not started yet' : 'Stream ended'}
            </Text>
          </View>
        )}

        {/* Back button overlay */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Live badge overlay */}
        {s.status === 'live' && (
          <View style={styles.liveOverlay}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewerOverlay}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.viewerText}>{formatCount(s.viewerCount)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stream Info */}
      <View style={[styles.infoSection, { backgroundColor: c.background }]}>
        <View style={styles.hostRow}>
          <Avatar uri={s.host.avatar} name={s.host.name} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.streamTitle, { color: c.foreground }]}>
              {s.title}
            </Text>
            <Text style={[styles.hostName, { color: c.mutedForeground }]}>
              {s.host.name} · {s.category.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Chat */}
      {s.chatEnabled && (
        <View style={[styles.chatSection, { backgroundColor: c.background }]}>
          <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item._id}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View style={styles.chatMsg}>
                <Text style={[styles.chatUsername, { color: c.primary }]}>
                  {item.sender.username}
                </Text>
                <Text style={[styles.chatContent, { color: c.foreground }]}>
                  {' '}{item.content}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.chatEmpty}>
                <Text style={{ color: c.mutedForeground, fontSize: fontSize.sm }}>
                  No chat messages yet. Say Assalamu Alaikum! 👋
                </Text>
              </View>
            }
          />

          <View style={[styles.chatInputRow, { borderTopColor: c.border }]}>
            <TextInput
              style={[styles.chatInput, { color: c.foreground, backgroundColor: c.card }]}
              placeholder="Send a message..."
              placeholderTextColor={c.mutedForeground}
              value={chatInput}
              onChangeText={setChatInput}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: c.primary }]}
              onPress={() => {
                if (chatInput.trim()) setChatInput('');
              }}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  noStream: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveOverlay: {
    position: 'absolute',
    top: 48,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  liveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  liveText: { color: '#fff', fontWeight: '800', fontSize: fontSize.xs },
  viewerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  viewerText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  infoSection: {
    padding: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  streamTitle: { fontSize: fontSize.base, fontWeight: '700' },
  hostName: { fontSize: fontSize.sm, marginTop: 2 },
  chatSection: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chatMsg: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chatUsername: { fontWeight: '700', fontSize: fontSize.sm },
  chatContent: { fontSize: fontSize.sm },
  chatEmpty: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chatInput: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
