import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse } from '@/types/api';

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
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/register', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken);
    },
  });
}

export function useSession() {
  const { setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        return data.user;
      } catch {
        logout();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
