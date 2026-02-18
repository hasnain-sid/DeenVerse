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
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
        if (data.user) {
          setUser(data.user);
        }
        return data.user;
      } catch {
        // Refresh failed — try the old /me endpoint as fallback
        try {
          const { data } = await api.get('/user/me');
          setUser(data.user);
          return data.user;
        } catch {
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) logout();
          return null;
        }
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
