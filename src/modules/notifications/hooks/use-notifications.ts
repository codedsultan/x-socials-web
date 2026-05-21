'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { useAuthStore } from '@/modules/auth/store';
import { toast } from '@/shared/components/ui/toast';
import type { ApiSuccess, PagedResult } from '@/shared/types/api';

export type NotificationType =
  | 'like_post' | 'like_comment' | 'follow' | 'comment' | 'reply'
  | 'content_removed';

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  referenceId: string | null;
  read: boolean;
  createdAt?: string;
}


const LIMIT = 20;

// ─── useNotifications — keyset infinite ──────────────────────────────────────

export function useNotifications(unreadOnly = false) {
  const isAuthed = useAuthStore((s) => s.isAuthed());

  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications.list, { unreadOnly }],

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('after', pageParam);
      if (unreadOnly) params.set('unread', 'true');
      return api.get(`notifications?${params}`).json<ApiSuccess<PagedResult<Notification>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),

    enabled: isAuthed,
    // Refresh every 30 s so the bell stays current without websockets
    refetchInterval: 30_000,
  });
}

// ─── useUnreadCount — polled every 30 s ──────────────────────────────────────

export function useUnreadCount() {
  const isAuthed = useAuthStore((s) => s.isAuthed());

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () =>
      api.get('notifications/unread-count').json<ApiSuccess<{ count: number }>>(),
    select: (res) => res.data.count,
    enabled: isAuthed,
    refetchInterval: 30_000,
  });
}

// ─── useMarkRead ──────────────────────────────────────────────────────────────

export function useMarkRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch(`notifications/${notificationId}/read`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}

// ─── useMarkAllRead ───────────────────────────────────────────────────────────

export function useMarkAllRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('notifications/read-all'),

    onSuccess: () => {
      toast.success('All notifications marked as read');
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}
