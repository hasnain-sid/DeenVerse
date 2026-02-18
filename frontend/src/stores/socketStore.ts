import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  onlineUsers: Set<string>;

  setConnected: (connected: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  isUserOnline: (userId: string) => boolean;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  onlineUsers: new Set(),

  setConnected: (isConnected) => set({ isConnected }),

  setUserOnline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),

  setUserOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

  isUserOnline: (userId) => get().onlineUsers.has(userId),
}));
