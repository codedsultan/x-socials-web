'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Heart, UserPlus, MessageCircle, Reply, Check } from 'lucide-react';
import { cn, timeAgo } from '@/shared/lib/utils';
import { Spinner } from '@/shared/components/ui/primitives';
import { Button } from '@/shared/components/ui/button';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  type Notification,
  type NotificationType,
} from '../hooks/use-notifications';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';

// ─── Type label + icon map ────────────────────────────────────────────────────

const typeConfig: Record<NotificationType, { label: string; Icon: React.ElementType; color: string }> = {
  like_post: { label: 'liked your post', Icon: Heart, color: 'text-red-400' },
  like_comment: { label: 'liked your comment', Icon: Heart, color: 'text-red-400' },
  follow: { label: 'followed you', Icon: UserPlus, color: 'text-brand-500' },
  comment: { label: 'commented on your post', Icon: MessageCircle, color: 'text-green-500' },
  reply: { label: 'replied to your comment', Icon: Reply, color: 'text-blue-500' },
};

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({ notification }: { notification: Notification }) {
  const markRead = useMarkRead();
  const config = typeConfig[notification.type] ?? typeConfig.comment;
  const { Icon } = config;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors',
        notification.read
          ? 'opacity-60'
          : 'bg-brand-50/50 dark:bg-brand-900/10'
      )}
    >
      <div className={cn('shrink-0 mt-0.5', config.color)}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
          <span className="font-medium">{notification.actorId.slice(0, 8)}…</span>
          {' '}{config.label}
        </p>
        <p className="text-xs text-neutral-400">{timeAgo(notification.createdAt)}</p>
      </div>

      {!notification.read && (
        <button
          onClick={() => markRead.mutate(notification.id)}
          disabled={markRead.isPending}
          className="shrink-0 p-1 rounded text-neutral-300 hover:text-brand-500 transition-colors"
          aria-label="Mark as read"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── NotificationBell (main export) ──────────────────────────────────────────
interface NotificationBellProps {
  showLabel?: boolean;
}

export function NotificationBell({ showLabel = false }: NotificationBellProps) {

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadCount();
  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage,
  } = useNotifications();
  const markAllRead = useMarkAllRead();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore);

  const unreadCount = unread ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative flex items-center gap-3 rounded-xl transition-all',
          showLabel
            ? 'w-full px-3 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            : 'h-9 w-9 justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <div className="relative shrink-0">
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {showLabel && <span>Notifications</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 max-h-[480px] overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-black/30 animate-fade-up z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-brand-500">{unreadCount} new</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost" size="sm"
                onClick={() => markAllRead.mutate()}
                loading={markAllRead.isPending}
                className="text-xs h-7"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-50 dark:divide-neutral-800">
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner className="h-5 w-5" /></div>
            ) : !data?.items.length ? (
              <p className="text-sm text-neutral-400 text-center py-8">No notifications yet</p>
            ) : (
              <>
                {data.items.map((n) => (
                  <NotificationRow key={n.id} notification={n} />
                ))}
                <div ref={sentinelRef} className="h-1" />
                {isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <Spinner className="h-4 w-4" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
