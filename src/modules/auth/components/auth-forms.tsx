'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
} from '../hooks/use-auth';

// ─── LoginForm ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setApiError('');
    try { await login.mutateAsync(values); }
    catch (err) { setApiError(err instanceof Error ? err.message : 'Login failed'); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="alice@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {apiError && <ApiErrorBox message={apiError} />}

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Sign in
      </Button>

      <p className="text-center text-sm text-neutral-500">
        No account?{' '}
        <Link href="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const register_ = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterValues) {
    setApiError('');
    try { await register_.mutateAsync(values); }
    catch (err) { setApiError(err instanceof Error ? err.message : 'Registration failed'); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Alice Admin"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="alice@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {apiError && <ApiErrorBox message={apiError} />}

      <Button type="submit" size="lg" className="w-full" loading={register_.isPending}>
        Create account
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase(),
});
type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const forgot = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(values: ForgotValues) {
    await forgot.mutateAsync(values);
    setSentEmail(values.email);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">📬</div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          If <strong>{sentEmail}</strong> is registered, a reset code is on its way.
          Check your inbox and{' '}
          <Link href="/reset-password" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            enter the code
          </Link>
          .
        </p>
        <p className="text-xs text-neutral-400">The code expires in 10 minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-neutral-500">
        Enter your account email and we'll send a 6-digit reset code.
      </p>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="alice@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" size="lg" className="w-full" loading={forgot.isPending}>
        Send reset code
      </Button>
      <p className="text-center text-sm text-neutral-500">
        <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

// ─── ResetPasswordForm ────────────────────────────────────────────────────────

const resetSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase(),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});
type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const reset = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(values: ResetValues) {
    setApiError('');
    try { await reset.mutateAsync(values); }
    catch (err) { setApiError(err instanceof Error ? err.message : 'Reset failed'); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-neutral-500">
        Enter your email, the 6-digit code from your inbox, and your new password.
      </p>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="alice@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Reset code"
        placeholder="123456"
        inputMode="numeric"
        maxLength={6}
        error={errors.code?.message}
        {...register('code')}
      />
      <div className="relative">
        <Input
          label="New password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {apiError && <ApiErrorBox message={apiError} />}

      <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
        Set new password
      </Button>

      <p className="text-center text-sm text-neutral-500">
        <Link href="/forgot-password" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Resend code
        </Link>
      </p>
    </form>
  );
}

// ─── VerifyEmailForm ──────────────────────────────────────────────────────────

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
});
type VerifyValues = z.infer<typeof verifySchema>;

export function VerifyEmailForm() {
  const [apiError, setApiError] = useState('');
  const verify = useVerifyEmail();

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
  });

  async function onSubmit(values: VerifyValues) {
    setApiError('');
    try { await verify.mutateAsync(values); }
    catch (err) { setApiError(err instanceof Error ? err.message : 'Verification failed'); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-neutral-500">
        Enter the 6-digit code sent to your email address.
      </p>
      <Input
        label="Verification code"
        placeholder="123456"
        inputMode="numeric"
        maxLength={6}
        error={errors.code?.message}
        {...register('code')}
      />
      {apiError && <ApiErrorBox message={apiError} />}
      <Button type="submit" size="lg" className="w-full" loading={verify.isPending}>
        Verify email
      </Button>
    </form>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function ApiErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
