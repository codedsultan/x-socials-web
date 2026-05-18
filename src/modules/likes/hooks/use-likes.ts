'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ApiSuccess, LikeResponse, LikeTarget, FeedItem, PagedResult } from '@/shared/types/api';

interface ToggleLikeArgs {
  targetId:   string;
  targetType: LikeTarget;
  /** Current liked state — used for optimistic update */
  currentlyLiked: boolean;
}

/**
 * Optimistic like toggle.
 *
 * 1. Immediately flip likedByMe + likesCount in every feed/post cache entry.
 * 2. Fire the mutation.
 * 3. On error, roll back via the snapshot taken before the optimistic update.
 */
export function useToggleLike() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, targetType }: ToggleLikeArgs) =>
      api
        .post('likes', { json: { targetId, targetType } })
        .json<ApiSuccess<LikeResponse>>(),

    onMutate: async ({ targetId, targetType, currentlyLiked }) => {
      if (targetType !== 'post') return;

      // Cancel in-flight fetches that would overwrite our optimistic update
      await qc.cancelQueries({ queryKey: queryKeys.posts.feed });

      // Snapshot current feed cache for rollback
      const snapshot = qc.getQueriesData({ queryKey: queryKeys.posts.feed });

      // Apply optimistic update to every page of every feed query
      qc.setQueriesData(
        { queryKey: queryKeys.posts.feed },
        (old: { pages: Array<{ data: PagedResult<FeedItem> }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.map((item) =>
                  item.id === targetId
                    ? {
                        ...item,
                        likedByMe:  !currentlyLiked,
                        likesCount: item.likesCount + (currentlyLiked ? -1 : 1),
                      }
                    : item
                ),
              },
            })),
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Roll back optimistic update
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          qc.setQueryData(key, data);
        }
      }
    },

    onSettled: () => {
      // Background re-fetch to sync with server truth
      qc.invalidateQueries({ queryKey: queryKeys.posts.feed });
    },
  });
}
