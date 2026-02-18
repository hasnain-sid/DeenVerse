import { useEffect, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import api from '../lib/api';
import { getQueuedActions, clearActionQueue, isOnline } from '../lib/offlineCache';

/**
 * Hook that monitors network state and syncs queued offline actions
 * when the device comes back online.
 */
export function useOfflineSync() {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      setOnline(isConnected);

      // Trigger sync when coming back online
      if (isConnected) {
        syncOfflineActions();
      }
    });

    return unsubscribe;
  }, []);

  // Also check when app comes to foreground
  useEffect(() => {
    const handleAppState = async (state: AppStateStatus) => {
      if (state === 'active') {
        const connected = await isOnline();
        setOnline(connected);
        if (connected) syncOfflineActions();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  // Sync queued actions
  const syncOfflineActions = useCallback(async () => {
    const actions = await getQueuedActions();
    if (actions.length === 0) return;

    setSyncing(true);
    setQueueLength(actions.length);

    let successCount = 0;

    for (const action of actions) {
      try {
        switch (action.method) {
          case 'POST':
            await api.post(action.url, action.body);
            break;
          case 'PUT':
            await api.put(action.url, action.body);
            break;
          case 'PATCH':
            await api.patch(action.url, action.body);
            break;
          case 'DELETE':
            await api.delete(action.url);
            break;
        }
        successCount++;
      } catch (err) {
        console.warn('Failed to sync offline action:', action.url, err);
        // Skip failed actions — could retry later
      }
    }

    // Clear queue after attempting all
    await clearActionQueue();
    setSyncing(false);
    setQueueLength(0);
    console.log(`Synced ${successCount}/${actions.length} offline actions`);
  }, []);

  return { online, syncing, queueLength, syncOfflineActions };
}
