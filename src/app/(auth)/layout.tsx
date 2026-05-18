import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-neutral-50 via-white to-brand-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <span className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap className="h-6 w-6 text-white fill-white" />
          </span>
          <h1 className="font-display text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            x-socials
          </h1>
          <p className="text-sm text-neutral-500">The platform for builders</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
