import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?:     'sm' | 'md' | 'lg' | 'icon';
  loading?:  boolean;
  asChild?:  boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, asChild, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
          'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
          'select-none cursor-pointer',
          // Variants
          variant === 'primary'   && 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95 shadow-sm',
          variant === 'secondary' && 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
          variant === 'ghost'     && 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
          variant === 'danger'    && 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
          variant === 'outline'   && 'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
          // Sizes
          size === 'sm'   && 'h-8  px-3 text-sm',
          size === 'md'   && 'h-10 px-4 text-sm',
          size === 'lg'   && 'h-12 px-6 text-base',
          size === 'icon' && 'h-9  w-9 p-0',
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
