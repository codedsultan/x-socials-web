import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/modules/auth/components/auth-forms';
import { SuspensionBanner } from '@/modules/auth/components/suspension-banner';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <>

      <Suspense fallback={null}>
        <SuspensionBanner />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Welcome back</h2>
        <LoginForm />
      </Suspense>
    </>
  );
}