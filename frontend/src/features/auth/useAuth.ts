import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post('/user/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data.user) {
        login(data.user, data.accessToken ?? '');
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post('/user/register', credentials);
      return data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/user/forgot-password', { email });
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const { data } = await api.post(`/user/reset-password/${token}`, { password });
      return data;
    },
  });
}

export function useSession() {
  const { setUser, setAccessToken, logout, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        // Try to refresh the session using the refresh token cookie
        const { data } = await api.post('/user/refresh');
        if (data.accessToken) setAccessToken(data.accessToken);
        if (data.user) setUser(data.user);
        return data.user ?? null;
      } catch (refreshErr: unknown) {
        // 401 = no session, expected for unauthenticated users — not an error
        const status = (refreshErr as { response?: { status?: number } })?.response?.status;
        if (status !== 401) {
          console.error('[session] refresh failed:', refreshErr);
        }

        // Fallback: if an access token is already in memory, hit /me directly
        const { accessToken, isAuthenticated } = useAuthStore.getState();
        if (accessToken) {
          try {
            const { data } = await api.get('/user/me');
            setUser(data.user);
            return data.user ?? null;
          } catch {
            // /me also failed — token is invalid, log the user out
            if (isAuthenticated) logout();
            return null;
          }
        }

        // No token at all — if the store thinks we're logged in, clear it
        if (isAuthenticated) logout();
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
