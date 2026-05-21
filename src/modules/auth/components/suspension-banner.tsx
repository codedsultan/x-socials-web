'use client';

import { useSearchParams } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

/**
 * Renders a warning banner on the login page when the user was redirected
 * here because their account is suspended.
 *
 * The api.ts afterResponse hook sets ?reason=suspended when it intercepts
 * a 403 "suspended" response and clears the auth state.
 */
export function SuspensionBanner() {
  const params = useSearchParams();
  if (params.get('reason') !== 'suspended') return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 mb-6">
      <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
          Account suspended
        </p>
        <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">
          Your account has been suspended for violating our community guidelines.
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
