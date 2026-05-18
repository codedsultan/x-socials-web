import type { Metadata } from 'next';
import { LoginForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Welcome back</h2>
      <LoginForm />
    </>
  );
}
