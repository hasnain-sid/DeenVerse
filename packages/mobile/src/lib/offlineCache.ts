import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

/**
 * Simple offline cache for read content (hadiths, posts).
 * Uses SecureStore for small data; for larger data consider expo-file-system.
 */

const CACHE_PREFIX = 'offline_cache_';
const MAX_ITEMS_PER_KEY = 50;

export async function cacheData(key: string, data: any): Promise<void> {
  try {
    const value = JSON.stringify({
      data,
      timestamp: Date.now(),
    });
    await SecureStore.setItemAsync(CACHE_PREFIX + key, value);
  } catch (err) {
    console.warn('Failed to cache data:', key, err);
  }
}

export async function getCachedData<T>(
  key: string,
  maxAgeMs = 24 * 60 * 60 * 1000, // 24 hours default
): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_PREFIX + key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > maxAgeMs) {
      // Expired
      await SecureStore.deleteItemAsync(CACHE_PREFIX + key);
      return null;
    }

    return parsed.data as T;
  } catch {
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Check if the device is currently online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch {
    return false;
  }
}

/**
 * Offline action queue — stores actions to retry when back online
 */
interface QueuedAction {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline_action_queue';

export async function queueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(QUEUE_KEY);
    const queue: QueuedAction[] = raw ? JSON.parse(raw) : [];

    queue.push({
      ...action,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    });

    // Keep max 100 queued actions
    const trimmed = queue.slice(-100);
    await SecureStore.setItemAsync(QUEUE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to queue offline action:', err);
  }
}

export async function getQueuedActions(): Promise<QueuedAction[]> {
  try {
    const raw = await SecureStore.getItemAsync(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearActionQueue(): Promise<void> {
  await SecureStore.deleteItemAsync(QUEUE_KEY);
}
