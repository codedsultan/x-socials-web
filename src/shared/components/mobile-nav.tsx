'use client';

import Link from 'next/link';
import { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Home, Search, User, PenSquare } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/modules/auth/store';
import { CreatePostForm } from '@/modules/posts/components/create-post-form';
import { NotificationBell } from '@/modules/notifications/components/notification-bell';

const navItems = [
  { href: '/feed' as Route, icon: Home, label: 'Feed' },
  { href: '/search' as Route, icon: Search, label: 'Explore' },
];

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [compose, setCompose] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 safe-area-pb">
        <div className="flex items-center justify-around px-2 h-14">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors',
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                )}
                aria-label={label}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          {user ? (
            <>
              <button
                onClick={() => setCompose(true)}
                className="flex flex-col items-center gap-0.5 px-4 py-2 text-neutral-400 hover:text-brand-500 transition-colors"
                aria-label="New post"
              >
                <PenSquare className="h-5 w-5" />
                <span className="text-[10px] font-medium">Post</span>
              </button>

              <Link
                href={`/users/${user.id}`}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors',
                  pathname.startsWith('/users')
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                )}
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
                <span className="text-[10px] font-medium">Profile</span>
              </Link>

            </>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 px-4 py-2 text-neutral-400 hover:text-brand-500 transition-colors"
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">Sign in</span>
            </Link>
          )}
          {user && <NotificationBell />}

        </div>
      </nav>

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in md:hidden">
          <div className="w-full sm:max-w-lg bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-xl p-6 space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">New Post</h2>
              <button
                onClick={() => setCompose(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <CreatePostForm onSuccess={() => setCompose(false)} />
          </div>
        </div>
      )}
    </>
  );
}
