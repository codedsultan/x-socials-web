/**
 * Centralised query key factory.
 * Every key is a tuple so invalidation is predictable:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
 *   invalidates all post queries including infinite ones.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all:       ['users'] as const,
    list:      (page: number, limit: number) => ['users', 'list', page, limit] as const,
    detail:    (id: string) => ['users', id] as const,
    followers: (id: string) => ['users', id, 'followers'] as const,
    following: (id: string) => ['users', id, 'following'] as const,
  },
  posts: {
    all:    ['posts'] as const,
    feed:   ['posts', 'feed'] as const,
    list:   (params: Record<string, unknown>) => ['posts', 'list', params] as const,
    detail: (id: string) => ['posts', id] as const,
    byUser: (userId: string) => ['posts', 'user', userId] as const,
  },
  comments: {
    list:    (postId: string) => ['comments', postId] as const,
    replies: (commentId: string) => ['comments', 'replies', commentId] as const,
  },
  likes: {
    count: (targetId: string, targetType: string) =>
      ['likes', 'count', targetId, targetType] as const,
  },
};
