// COPY TO: src/app/(auth)/reset-password/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'Set new password' };

export default function ResetPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Set new password</h2>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
