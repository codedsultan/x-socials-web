'use client';

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { toast } from '@/shared/components/ui/toast';
import type {
  ApiSuccess, Post, PagedResult, CreatePostDto, UpdatePostDto,
} from '@/shared/types/api';

const LIMIT = 20;

// ─── usePost ──────────────────────────────────────────────────────────────────

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn:  () => api.get(`posts/${id}`).json<ApiSuccess<{ post: Post }>>(),
    select:   (res) => res.data.post,
    enabled:  !!id,
  });
}

// ─── usePosts (offset — filtered by tag/author) ───────────────────────────────

interface UsePostsParams {
  tag?:      string;
  authorId?: string;
  page?:     number;
}

export function usePosts(params: UsePostsParams = {}) {
  const { tag, authorId, page = 1 } = params;
  const searchParams = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (tag)      searchParams.set('tag', tag);
  if (authorId) searchParams.set('authorId', authorId);

  return useQuery({
    queryKey: queryKeys.posts.list({ tag, authorId, page }),
    queryFn:  () =>
      api.get(`posts?${searchParams}`).json<ApiSuccess<PagedResult<Post>>>(),
    select: (res) => res.data,
  });
}

// ─── usePostTimeline (cursor — for main posts list without filters) ────────────

export function usePostTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list({ mode: 'cursor' }),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(LIMIT) });
      if (pageParam) params.set('cursor', pageParam);
      return api.get(`posts?${params}`).json<ApiSuccess<PagedResult<Post>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,

    select: (data) => ({
      pages:   data.pages,
      pageParams: data.pageParams,
      items:   data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),
  });
}

// ─── useCreatePost ────────────────────────────────────────────────────────────

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePostDto) =>
      api.post('posts', { json: dto }).json<ApiSuccess<{ post: Post }>>(),

    onSuccess: () => {
      toast.success('Post published!');
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.feed });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}

// ─── useUpdatePost ────────────────────────────────────────────────────────────

export function useUpdatePost(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePostDto) =>
      api.patch(`posts/${postId}`, { json: dto }).json<ApiSuccess<{ post: Post }>>(),

    onSuccess: (res) => {
      qc.setQueryData(queryKeys.posts.detail(postId), res);
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}

// ─── useDeletePost ────────────────────────────────────────────────────────────

export function useDeletePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.delete(`posts/${postId}`),

    onSuccess: (_data, postId) => {
      qc.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.feed });
    },

    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}
