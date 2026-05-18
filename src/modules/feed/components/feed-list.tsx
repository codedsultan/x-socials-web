'use client';

import { useCallback, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { PostCard } from '@/modules/posts/components/post-card';
import { EditPostModal } from '@/modules/posts/components/edit-post-modal';
import { PostCardSkeleton, EmptyState, Spinner } from '@/shared/components/ui/primitives';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { useHomeFeed } from '../hooks/use-feed';
import type { FeedItem } from '@/shared/types/api';

export function FeedList() {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, isError } = useHomeFeed();
  const [editingPost, setEditingPost] = useState<FeedItem | null>(null);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load feed"
        message="Check your connection and try again"
      />
    );
  }

  if (!data?.items.length) {
    return (
      <EmptyState
        icon={<Newspaper className="h-12 w-12" />}
        title="Nothing here yet"
        message="Follow some users to see their posts, or write your first post"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.items.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            likedByMe={post.likedByMe}
            onEdit={() => setEditingPost(post)}
          />
        ))}

        <div ref={sentinelRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner className="h-5 w-5" />
          </div>
        )}

        {!hasNextPage && data.items.length > 0 && (
          <p className="text-center text-sm text-neutral-400 py-4">
            You&apos;re all caught up ✓
          </p>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}
    </>
  );
}
