'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { useAuthStore } from '@/modules/auth/store';
import type { ApiSuccess, FeedItem, PagedResult } from '@/shared/types/api';

const LIMIT = 20;

// ─── useHomeFeed ──────────────────────────────────────────────────────────────

export function useHomeFeed() {
  const isAuthed = useAuthStore((s) => s.isAuthed());

  return useInfiniteQuery({
    queryKey: [...queryKeys.posts.feed, { authed: isAuthed }],

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('cursor', pageParam);
      return api.get(`feed?${params}`).json<ApiSuccess<PagedResult<FeedItem>>>();
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (last) =>
      last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages:    data.pages,
      pageParams: data.pageParams,
      // Flatten items from all pages into one array for easy rendering
      items:    data.pages.flatMap((p) => p.data.items),
      hasMore:  data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),
  });
}

// ─── useUserFeed ──────────────────────────────────────────────────────────────

export function useUserFeed(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.byUser(userId),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('cursor', pageParam);
      return api
        .get(`feed/users/${userId}?${params}`)
        .json<ApiSuccess<PagedResult<FeedItem>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages:    data.pages,
      pageParams: data.pageParams,
      items:    data.pages.flatMap((p) => p.data.items),
      hasMore:  data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),

    enabled: !!userId,
  });
}
