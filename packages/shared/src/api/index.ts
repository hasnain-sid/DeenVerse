import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  /** Get the current access token. Platform-specific. */
  getAccessToken: () => string | null;
  /** Set a new access token after refresh. Platform-specific. */
  setAccessToken: (token: string) => void;
  /** Called when refresh fails — log the user out. Platform-specific. */
  onAuthFailure: () => void;
  /** Optional: set a user object after refresh. */
  setUser?: (user: unknown) => void;
  /** Whether to send cookies (web only, ignored on mobile). Default true. */
  withCredentials?: boolean;
}

/**
 * Create a platform-agnostic Axios API client with token refresh logic.
 *
 * Usage:
 *   Web — import.meta.env.VITE_API_URL, read from Zustand, redirect to /login
 *   Mobile — Constants.expoConfig.extra.apiUrl, read from SecureStore, navigate
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const {
    baseURL,
    getAccessToken,
    setAccessToken,
    onAuthFailure,
    setUser,
    withCredentials = true,
  } = config;

  const client = axios.create({
    baseURL: `${baseURL}/api/v1`,
    withCredentials,
    headers: { 'Content-Type': 'application/json' },
  });

  // ── Request interceptor — attach access token
  client.interceptors.request.use((req) => {
    const token = getAccessToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  // ── Response interceptor — auto-refresh on 401
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    failedQueue = [];
  }

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      const isAuthRoute =
        originalRequest.url?.includes('/login') ||
        originalRequest.url?.includes('/register') ||
        originalRequest.url?.includes('/refresh');

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthRoute
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(client(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await client.post('/user/refresh');
          setAccessToken(data.accessToken);
          if (setUser && data.user) setUser(data.user);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          processQueue(null, data.accessToken);
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          onAuthFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}
