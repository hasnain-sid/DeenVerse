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
        login(data.user, ''); // Token is in httpOnly cookie
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

export function useSession() {
  const { setUser, logout, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/user/me');
        setUser(data.user);
        return data.user;
      } catch {
        logout();
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
