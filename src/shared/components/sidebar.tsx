'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, PenSquare, LogOut, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Avatar } from '@/shared/components/ui/primitives';
import { useAuthStore } from '@/modules/auth/store';
import { useLogout } from '@/modules/auth/hooks/use-auth';
import { useState } from 'react';
import { CreatePostForm } from '@/modules/posts/components/create-post-form';

const navItems = [
  { href: '/feed',   icon: Home,      label: 'Feed' },
  { href: '/search', icon: Search,    label: 'Explore' },
];

export function Sidebar() {
  const pathname    = usePathname();
  const { theme, setTheme } = useTheme();
  const user        = useAuthStore((s) => s.user);
  const logout      = useLogout();
  const [compose, setCompose] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col z-20 p-4 gap-2">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 px-2 py-3 mb-2">
          <span className="h-8 w-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white fill-white" />
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
            x-socials
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                )}
              >
                <Icon className={cn('h-4.5 w-4.5', active && 'stroke-[2.5px]')} />
                {label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={`/users/${user.id}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname.startsWith('/users')
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              )}
            >
              <User className="h-4.5 w-4.5" />
              Profile
            </Link>
          )}
        </nav>

        {/* Compose */}
        {user && (
          <Button onClick={() => setCompose(true)} className="w-full">
            <PenSquare className="h-4 w-4" />
            New Post
          </Button>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-1 space-y-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {user ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar name={user.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={() => logout.mutate()}
                aria-label="Logout"
                className="text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="w-full">Sign in</Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">New Post</h2>
              <Button variant="ghost" size="icon" onClick={() => setCompose(false)}>✕</Button>
            </div>
            <CreatePostForm onSuccess={() => setCompose(false)} />
          </div>
        </div>
      )}
    </>
  );
}
