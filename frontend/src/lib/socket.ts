import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

let socket: Socket | null = null;

/**
 * Get or create the Socket.IO client singleton.
 * Automatically authenticates with the user's access token.
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connect to the Socket.IO server.
 * Call this after authentication (login or session restore).
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const { accessToken } = useAuthStore.getState();

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    withCredentials: true, // sends cookies (refresh token) as fallback
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect from the Socket.IO server.
 * Call this on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log('Socket manually disconnected');
  }
}

/**
 * Reconnect with a new token (e.g. after token refresh).
 */
export function reconnectSocket(): void {
  disconnectSocket();
  connectSocket();
}
