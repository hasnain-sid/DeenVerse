import Constants from 'expo-constants';
import { createApiClient } from '@deenverse/shared';
import { useAuthStore } from '../stores/authStore';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8081';

export const api = createApiClient({
  baseURL: API_URL,
  withCredentials: false, // Mobile uses Bearer tokens instead of cookies
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  setUser: (user) => useAuthStore.getState().setUser(user as any),
  onAuthFailure: () => useAuthStore.getState().logout(),
});

export default api;
