import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { spacing, fontSize, borderRadius } from '../../src/theme';
import { formatCount } from '@deenverse/shared';
import api from '../../src/lib/api';

export default function ProfileScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch {} // ignore error
    logout();
  };

  if (!user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header area */}
      <View style={[styles.coverArea, { backgroundColor: c.primary + '15' }]}>
        <View style={styles.settingsRow}>
          <TouchableOpacity onPress={() => router.push('/settings' as any)}>
            <Ionicons name="settings-outline" size={24} color={c.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar + Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Avatar uri={user.avatar} name={user.name} size={80} />
        </View>

        <Text style={[styles.name, { color: c.foreground }]}>{user.name}</Text>
        <Text style={[styles.username, { color: c.mutedForeground }]}>
          @{user.username}
        </Text>

        {user.bio ? (
          <Text style={[styles.bio, { color: c.foreground }]}>{user.bio}</Text>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: c.foreground }]}>
              {formatCount(user.followers?.length ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
              Followers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: c.foreground }]}>
              {formatCount(user.following?.length ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
              Following
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: c.foreground }]}>
              {formatCount(user.saved?.length ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
              Saved
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Button
            title="Edit Profile"
            variant="outline"
            size="sm"
            onPress={() => router.push('/edit-profile' as any)}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={[styles.menuSection, { borderTopColor: c.border }]}>
        {[
          { icon: 'bookmark-outline', label: 'Saved Items', route: '/saved' },
          { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
          { icon: 'book-outline', label: 'Hadith Collection', route: '/hadith' },
          { icon: 'moon-outline', label: 'Appearance', route: '/settings' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, { borderBottomColor: c.border }]}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon as any} size={22} color={c.foreground} />
            <Text style={[styles.menuLabel, { color: c.foreground }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={c.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }}>
        <Button
          title="Log Out"
          variant="destructive"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverArea: {
    height: 120,
    justifyContent: 'flex-end',
  },
  settingsRow: {
    position: 'absolute',
    top: 52,
    right: spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarWrapper: {
    marginTop: -40,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  username: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing['3xl'],
    marginVertical: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    paddingHorizontal: spacing['3xl'],
  },
  menuSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '500',
  },
});
