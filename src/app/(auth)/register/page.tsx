import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/modules/auth/components/auth-forms';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Create your account</h2>
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </>
  );
}