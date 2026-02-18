import { useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch (err) {
    console.error('Error getting push token:', err);
    return null;
  }
}

// Android notification channel
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10b981',
  });

  Notifications.setNotificationChannelAsync('streams', {
    name: 'Live Streams',
    description: 'Notifications when scholars go live',
    importance: Notifications.AndroidImportance.HIGH,
  });

  Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    description: 'Direct message notifications',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const registerPush = useCallback(async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      try {
        // Register token with backend
        await api.post('/push/subscribe-mobile', { expoPushToken: token });
        console.log('Push token registered:', token);
      } catch (err) {
        console.error('Failed to register push token with backend:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    registerPush();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification.request.content);
      },
    );

    // Listen for notification tap / interaction
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped, data:', data);
        // Deep linking handled by Expo Router automatically
        // if data contains a path like /post/123, router will handle it
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, registerPush]);

  const getBadgeCount = useCallback(async () => {
    return Notifications.getBadgeCountAsync();
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    return Notifications.setBadgeCountAsync(count);
  }, []);

  return { registerPush, getBadgeCount, setBadgeCount };
}
