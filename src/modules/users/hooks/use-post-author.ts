'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ApiSuccess, UserProfile } from '@/shared/types/api';

/**
 * Lightweight hook that resolves a user profile from an authorId.
 * Results are cached indefinitely (author names don't change often).
 * Returns { name, email } — falls back to a truncated ID on error.
 */
export function usePostAuthor(authorId: string) {
  const { data } = useQuery({
    queryKey: queryKeys.users.detail(authorId),
    queryFn:  () => api.get(`users/${authorId}`).json<ApiSuccess<{ user: UserProfile }>>(),
    select:   (res) => res.data.user,
    staleTime: 10 * 60_000, // 10 min — profiles are stable
    retry:     false,        // don't spam the API on missing users
  });

  return {
    name:      data?.name ?? data?.email ?? `${authorId.slice(0, 8)}…`,
    email:     data?.email,
    isLoading: !data,
  };
}
