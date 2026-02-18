import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { LoginInput, RegisterInput } from '@deenverse/shared';

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
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
    mutationFn: async (credentials: RegisterInput) => {
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

export function useSession() {
  const { setUser, setAccessToken, logout, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data } = await api.post('/user/refresh');
        if (data.accessToken) setAccessToken(data.accessToken);
        if (data.user) setUser(data.user);
        return data.user;
      } catch {
        try {
          const { data } = await api.get('/user/me');
          setUser(data.user);
          return data.user;
        } catch {
          logout();
          return null;
        }
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
