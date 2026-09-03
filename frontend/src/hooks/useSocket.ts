import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import type { Notification } from '@/types/post';

/**
 * Master hook that manages the Socket.IO lifecycle.
 * Mount this once near the root of the app (e.g. in SessionRestorer or App).
 *
 * - Connects once the user is authenticated AND an access token is in memory.
 * - Disconnects on logout.
 * - Sets up listeners for notifications, chat, feed, and online status.
 */
export function useSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { setConnected, setUserOnline, setUserOffline } = useSocketStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setConnected(false);
      return;
    }

    // isAuthenticated is restored from localStorage but the access token is not, so on
    // a reload this runs before useSession() has refreshed. Waiting for the token keeps
    // the handshake on the bearer path instead of the refresh cookie.
    if (!accessToken) {
      setConnected(false);
      return;
    }

    const socket = connectSocket();

    // ─── Connection state ────────────────────────
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // ─── Online / Offline status ─────────────────
    socket.on('user:online', ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    });

    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    });

    // ─── Real-time notifications ─────────────────
    socket.on('notification:new', (notification: Notification) => {
      // Update the unread count in the cache
      queryClient.setQueryData<{ count: number }>(
        ['notifications-unread-count'],
        (old) => ({ count: (old?.count ?? 0) + 1 })
      );

      // Invalidate notifications list so it refreshes
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show toast notification
      const typeLabels: Record<string, string> = {
        like: '❤️ liked your post',
        reply: '💬 replied to your post',
        follow: '👤 started following you',
        repost: '🔁 reposted your post',
        mention: '📢 mentioned you',
        system: '🔔 System notification',
      };
      const label = typeLabels[notification.type] || 'New notification';
      const senderName = notification.sender?.name || 'Someone';

      toast(`${senderName} ${label}`, {
        icon: notification.type === 'like' ? '❤️' : '🔔',
        duration: 4000,
      });
    });

    // ─── Real-time chat messages ─────────────────
    socket.on(
      'chat:new-message',
      ({ conversationId }: { conversationId: string; message: unknown }) => {
        // Update unread count badge
        queryClient.setQueryData<{ count: number }>(
          ['chat-unread-count'],
          (old) => ({ count: (old?.count ?? 0) + 1 })
        );

        // Invalidate conversations list and specific conversation messages
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

        toast('💬 New message received', { duration: 3000 });
      }
    );

    // ─── Live stream events ─────────────────────
    socket.on(
      'stream:live',
      ({ host, title }: { streamId: string; host: { name: string }; title: string; category: string }) => {
        toast(`🔴 ${host.name} is now live: ${title}`, { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ['streams'] });
      }
    );

    // ─── Cleanup on unmount or auth change ───────
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('notification:new');
      socket.off('chat:new-message');
      socket.off('stream:live');
    };
  }, [isAuthenticated, accessToken, setConnected, setUserOnline, setUserOffline, queryClient]);
}
