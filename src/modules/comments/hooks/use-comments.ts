'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ApiSuccess, Comment, PagedResult, CreateCommentDto } from '@/shared/types/api';
import { HTTPError } from 'ky';

const LIMIT = 20;

// ─── useComments — keyset infinite ───────────────────────────────────────────

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(postId),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('after', pageParam);
      return api
        .get(`posts/${postId}/comments?${params}`)
        .json<ApiSuccess<PagedResult<Comment>>>();
    },

    initialPageParam: undefined as string | undefined,
    // Keyset: nextCursor is the raw ID of the last item
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),

    enabled: !!postId,
  });
}

// ─── useReplies — keyset infinite ─────────────────────────────────────────────

export function useReplies(commentId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.replies(commentId),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('after', pageParam);
      return api
        .get(`comments/${commentId}/replies?${params}`)
        .json<ApiSuccess<PagedResult<Comment>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),

    enabled: !!commentId,
  });
}

// ─── useCreateComment ─────────────────────────────────────────────────────────

export function useCreateComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCommentDto) =>
      api
        .post(`posts/${postId}/comments`, { json: dto })
        .json<ApiSuccess<{ comment: Comment }>>(),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(postId) });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}

// ─── useDeleteComment ─────────────────────────────────────────────────────────

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.delete(`comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(postId) });
    },
    // onError: async (err) => { throw new Error(await getApiError(err)); },
    onError: async (err, _commentId) => {
      // 404 = comment already gone (admin soft-deleted or race condition)
      // Treat as success — refresh the list so any tombstone shows
      if (err instanceof HTTPError && err.response.status === 404) {
        qc.invalidateQueries({ queryKey: queryKeys.comments.list(postId) });
        return;
      }
      throw new Error(await getApiError(err));
    },
  });
}
