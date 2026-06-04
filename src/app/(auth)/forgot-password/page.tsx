// COPY TO: src/app/(auth)/forgot-password/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Reset password</h2>
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
