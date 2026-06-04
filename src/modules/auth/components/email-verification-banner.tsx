'use client';

import { useState } from 'react';
import { Mail, X, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/store';
import { useRequestEmailVerification } from '@/modules/auth/hooks/use-auth';
import { cn } from '@/shared/lib/utils';

export function EmailVerificationBanner() {
  const isAuthed = useAuthStore((s) => s.isAuthed());
  const isVerified = useAuthStore((s) => s.isEmailVerified());
  const [dismissed, setDismissed] = useState(false);
  const resend = useRequestEmailVerification();
  const sent = resend.isSuccess;

  if (!isAuthed || isVerified || dismissed) return null;

  return (
    <div className="relative overflow-hidden border-b border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/10">
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-6 left-16 h-16 w-32 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-2xl" />
        <div className="absolute -top-4 right-40 h-12 w-24 rounded-full bg-orange-300/15 dark:bg-orange-500/8 blur-xl" />
      </div>

      <div className="relative flex items-center gap-4 px-4 py-3 md:px-6">
        {/* Icon */}
        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 ring-1 ring-amber-200/80 dark:ring-amber-700/50">
          {sent ? (
            <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 leading-tight">
            {sent ? 'Verification email sent' : 'Verify your email address'}
          </p>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-tight mt-0.5 hidden sm:block">
            {sent
              ? 'Check your inbox and click the link to activate your account.'
              : 'Confirm your email to unlock all features and secure your account.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!sent && (
            <button
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm shadow-amber-500/30',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'dark:bg-amber-500/90 dark:hover:bg-amber-500 dark:shadow-amber-900/40'
              )}
            >
              {resend.isPending ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Resend email
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-500/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
