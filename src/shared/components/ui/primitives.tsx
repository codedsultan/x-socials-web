import * as React from 'react';
import { cn, initials, avatarUrl } from '@/shared/lib/utils';

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'h-6  w-6  text-xs',
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ name = '', src, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const url = src ?? avatarUrl(name || 'unknown');

  return (
    <span className={cn('relative inline-flex shrink-0 rounded-full overflow-hidden bg-brand-500', sizeMap[size], className)}>
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} onError={() => setImgError(true)} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-semibold text-white">
          {initials(name)}
        </span>
      )
      }
    </span >
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-skeleton rounded-xl bg-neutral-200 dark:bg-neutral-800', className)} />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'default' && 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
      variant === 'brand' && 'bg-brand-50  text-brand-700  dark:bg-brand-900/30 dark:text-brand-300',
      variant === 'success' && 'bg-green-50  text-green-700  dark:bg-green-900/30 dark:text-green-300',
      variant === 'warning' && 'bg-amber-50  text-amber-700  dark:bg-amber-900/30 dark:text-amber-300',
      variant === 'danger' && 'bg-red-50    text-red-700    dark:bg-red-900/30   dark:text-red-300',
      className
    )}>
      {children}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
      {icon && <div className="text-neutral-300 dark:text-neutral-600">{icon}</div>}
      <div className="space-y-1">
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{title}</p>
        {message && <p className="text-sm text-neutral-500">{message}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin text-brand-500', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
