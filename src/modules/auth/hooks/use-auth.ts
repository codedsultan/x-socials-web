'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { useAuthStore } from '../store';
import { toast } from '@/shared/components/ui/toast';
import type { ApiSuccess, AuthResponse, LoginDto, RegisterDto } from '@/shared/types/api';

// ─── useMe ────────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthed = useAuthStore((s) => s.isAuthed());
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.get('auth/me').json<ApiSuccess<{ user: { id: string; email: string } }>>(),
    enabled: isAuthed,
    select: (res) => res.data.user,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) =>
      api.post('auth/login', { json: dto }).json<ApiSuccess<AuthResponse>>(),

    onSuccess: (res) => {
      const { user, tokens } = res.data;
      setAuth({ id: user.id, email: user.email }, tokens);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Welcome back!', user.email);
      router.push('/feed');
    },

    onError: async (err) => {
      const message = await getApiError(err);
      toast.error('Login failed', message);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterDto) =>
      api.post('auth/register', { json: dto }).json<ApiSuccess<AuthResponse>>(),

    onSuccess: (res) => {
      const { user, tokens } = res.data;
      setAuth({ id: user.id, email: user.email }, tokens);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Account created!', `Welcome, ${user.name ?? user.email}`);
      router.push('/feed');
    },

    onError: async (err) => {
      const message = await getApiError(err);
      toast.error('Registration failed', message);
    },
  });
}
// ─── useLogout ────────────────────────────────────────────────────────────────

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('auth/logout').json(),
    onSettled: () => {
      clearAuth();
      qc.clear();
      toast.info('Signed out');
      router.push('/login');
    },
  });
}

