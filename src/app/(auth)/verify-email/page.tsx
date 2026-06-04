// COPY TO: src/app/(auth)/verify-email/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'Verify email' };

export default function VerifyEmailPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Verify your email</h2>
      <p className="text-sm text-neutral-500 mb-6">
        We sent a 6-digit code to your email when you registered.
      </p>
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </>
  );
}
