'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id:       string;
  title:    string;
  message?: string;
  variant:  ToastVariant;
}

// ─── Store (simple — no Zustand needed for a notification queue) ───────────────

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: Listener[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export const toast = {
  success: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, title, message, variant: 'success' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 4000);
  },
  error: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, title, message, variant: 'error' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 5000);
  },
  info: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, title, message, variant: 'info' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 4000);
  },
};

function useToasts() {
  const [queue, setQueue] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    listeners.push(setQueue);
    return () => { listeners = listeners.filter(l => l !== setQueue); };
  }, []);

  return queue;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />,
  error:   <AlertCircle  className="h-4 w-4 text-red-500   shrink-0 mt-0.5" />,
  info:    <Info         className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />,
};

// ─── Toaster (mount once in root layout) ─────────────────────────────────────

export function Toaster() {
  const queue = useToasts();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {queue.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open
          className={cn(
            'group pointer-events-auto relative flex w-full items-start gap-3',
            'rounded-2xl border bg-white dark:bg-neutral-900 p-4 shadow-lg shadow-neutral-200/50 dark:shadow-black/30',
            'data-[state=open]:animate-slide-in data-[state=closed]:animate-fade-in',
            'transition-all duration-200',
            t.variant === 'error'   && 'border-red-100   dark:border-red-900/40',
            t.variant === 'success' && 'border-green-100 dark:border-green-900/40',
            t.variant === 'info'    && 'border-brand-100 dark:border-brand-900/40',
          )}
        >
          {icons[t.variant]}
          <div className="flex-1 space-y-0.5 min-w-0">
            <ToastPrimitive.Title className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.title}
            </ToastPrimitive.Title>
            {t.message && (
              <ToastPrimitive.Description className="text-xs text-neutral-500 leading-relaxed">
                {t.message}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            className="shrink-0 rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]" />
    </ToastPrimitive.Provider>
  );
}
