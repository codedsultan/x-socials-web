'use client';

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api, getApiError } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import type {
  ApiSuccess, UserProfile, PagedResult, FollowStatusResponse, UpdateProfileDto,
} from '@/shared/types/api';

// ─── useUser ──────────────────────────────────────────────────────────────────

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn:  () => api.get(`users/${id}`).json<ApiSuccess<{ user: UserProfile }>>(),
    select:   (res) => res.data.user,
    enabled:  !!id,
  });
}

// ─── useUsers (offset) ────────────────────────────────────────────────────────

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.users.list(page, limit),
    queryFn:  () =>
      api
        .get(`users?page=${page}&limit=${limit}`)
        .json<ApiSuccess<PagedResult<UserProfile>>>(),
    select: (res) => res.data,
  });
}

// ─── useFollowers — keyset infinite ──────────────────────────────────────────

export function useFollowers(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.followers(userId),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (pageParam) params.set('after', pageParam);
      return api
        .get(`users/${userId}/followers?${params}`)
        .json<ApiSuccess<PagedResult<UserProfile>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,
    select: (data) => ({
      pages:   data.pages,
      pageParams: data.pageParams,
      items:   data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),
    enabled: !!userId,
  });
}

// ─── useFollowing — keyset infinite ──────────────────────────────────────────

export function useFollowing(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.following(userId),

    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (pageParam) params.set('after', pageParam);
      return api
        .get(`users/${userId}/following?${params}`)
        .json<ApiSuccess<PagedResult<UserProfile>>>();
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.data.meta.nextCursor ?? undefined,
    select: (data) => ({
      pages:   data.pages,
      pageParams: data.pageParams,
      items:   data.pages.flatMap((p) => p.data.items),
      hasMore: data.pages.at(-1)?.data.meta.hasMore ?? false,
    }),
    enabled: !!userId,
  });
}

// ─── useFollow / useUnfollow ──────────────────────────────────────────────────

export function useFollow(targetUserId: string) {
  const qc = useQueryClient();

  const follow = useMutation({
    mutationFn: () =>
      api.post(`users/${targetUserId}/follow`).json<ApiSuccess<FollowStatusResponse>>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(targetUserId) });
      qc.invalidateQueries({ queryKey: queryKeys.users.followers(targetUserId) });
    },
    onError: async (err) => { throw new Error(await getApiError(err)); },
  });

  const unfollow = useMutation({
    mutationFn: () =>
      api.delete(`users/${targetUserId}/follow`).json<ApiSuccess<FollowStatusResponse>>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(targetUserId) });
      qc.invalidateQueries({ queryKey: queryKeys.users.followers(targetUserId) });
    },
    onError: async (err) => { throw new Error(await getApiError(err)); },
  });

  return { follow, unfollow };
}

// ─── useUpdateProfile ─────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      api.patch('users/me', { json: dto }).json<ApiSuccess<{ user: UserProfile }>>(),
    onSuccess: (res) => {
      const { user } = res.data;
      qc.setQueryData(queryKeys.users.detail(user.id), res);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: async (err) => { throw new Error(await getApiError(err)); },
  });
}
