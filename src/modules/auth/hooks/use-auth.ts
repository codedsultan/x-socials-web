'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { useAuthStore } from '../store';
import { toast } from '@/shared/components/ui/toast';
import { useSafeRedirect } from './use-safe-redirect';
import type {
  ApiSuccess,
  AuthResponse,
  LoginDto,
  RegisterDto,
  RequestOtpDto,
  VerifyEmailDto,
  ResetPasswordDto,
} from '@/shared/types/api';

// ─── useMe ───────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthed = useAuthStore((s) => s.isAuthed());
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () =>
      api.get('auth/me').json<ApiSuccess<{ user: { id: string; name?: string; email: string; emailVerifiedAt?: string | null } }>>(),
    enabled: isAuthed,
    select: (res) => res.data.user,
  });
}

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const qc = useQueryClient();
  const redirectTo = useSafeRedirect('/feed');

  return useMutation({
    mutationFn: (dto: LoginDto) =>
      api.post('auth/login', { json: dto }).json<ApiSuccess<AuthResponse>>(),

    onSuccess: (res) => {
      const { user, tokens } = res.data;
      // Persist name so the sidebar can show it without a /me fetch
      setAuth({ id: user.id, name: user.name, email: user.email }, tokens);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Welcome back!', user.email);
      router.push(redirectTo as any);
    },

    onError: async (err) => {
      const message = await getApiError(err);
      toast.error('Login failed', message);
    },
  });
}

// ─── useRegister ─────────────────────────────────────────────────────────────

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const qc = useQueryClient();
  const redirectTo = useSafeRedirect('/feed');

  return useMutation({
    mutationFn: (dto: RegisterDto) =>
      api.post('auth/register', { json: dto }).json<ApiSuccess<AuthResponse>>(),

    onSuccess: (res) => {
      const { user, tokens } = res.data;
      setAuth({ id: user.id, name: user.name, email: user.email }, tokens);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Account created!', `Welcome, ${user.name ?? user.email}`);
      // Backend sends a verification email automatically — hint the user
      toast.info('Verify your email', 'Check your inbox for a verification code.');
      router.push('/verify-email');
      // router.push(redirectTo as any);
    },

    onError: async (err) => {
      const message = await getApiError(err);
      toast.error('Registration failed', message);
    },
  });
}

// ─── useLogout ───────────────────────────────────────────────────────────────

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

// ─── useRequestEmailVerification ─────────────────────────────────────────────

export function useRequestEmailVerification() {
  return useMutation({
    mutationFn: () => api.post('auth/email/request'),
    onSuccess: () => toast.success('Code sent', 'Check your inbox for a 6-digit code.'),
    onError: async (err) => toast.error('Failed to send code', await getApiError(err)),
  });
}

// ─── useVerifyEmail ───────────────────────────────────────────────────────────

export function useVerifyEmail() {
  const setEmailVerified = useAuthStore((s) => s.setEmailVerified);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: VerifyEmailDto) =>
      api.post('auth/email/verify', { json: dto }),

    onSuccess: () => {
      setEmailVerified();
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Email verified!', 'Your account is fully active.');
      router.push('/feed');
    },

    onError: async (err) => {
      const message = await getApiError(err);
      toast.error('Verification failed', message);
    },
  });
}

// ─── useForgotPassword ───────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: RequestOtpDto) =>
      api.post('auth/password/forgot', { json: dto }),

    onSuccess: () =>
      toast.success('Code sent', 'If that email exists, a reset code is on its way.'),

    onError: async (err) =>
      toast.error('Request failed', await getApiError(err)),
  });
}

// ─── useResetPassword ────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: ResetPasswordDto) =>
      api.post('auth/password/reset', { json: dto }),

    onSuccess: () => {
      toast.success('Password updated', 'You can now sign in with your new password.');
      router.push('/login');
    },

    onError: async (err) =>
      toast.error('Reset failed', await getApiError(err)),
  });
}
