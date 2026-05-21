'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback } from 'react';
import { Users, FileText, ArrowLeft } from 'lucide-react';
import { Avatar, Spinner, EmptyState, PostCardSkeleton } from '@/shared/components/ui/primitives';
import { Button } from '@/shared/components/ui/button';
import { PostCard } from '@/modules/posts/components/post-card';
import { useUser, useFollow } from '@/modules/users/hooks/use-users';
import { useUserFeed } from '@/modules/feed/hooks/use-feed';
import { useAuthStore } from '@/modules/auth/store';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { compactNumber, formatDate } from '@/shared/lib/utils';
import type { FeedItem } from '@/shared/types/api';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const myUserId = useAuthStore((s) => s.user?.id);
  const isMe = myUserId === id;
  const isAuthed = useAuthStore((s) => s.isAuthed());

  const { data: user, isLoading } = useUser(id);
  const { follow, unfollow } = useFollow(id);
  const {
    data: feedData, isLoading: postsLoading,
    isFetchingNextPage, fetchNextPage, hasNextPage,
  } = useUserFeed(id);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>;
  if (!user) return <EmptyState title="User not found" />;

  if (user.suspended) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 text-center space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Users className="h-7 w-7 text-neutral-400" />
            </span>
          </div>
          <h2 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Account suspended</h2>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto">
            This account has been suspended for violating our community guidelines.
          </p>
        </div>
      </div>
    );
  }

  const following = user.isFollowedByMe ?? false;

  return (
    <div className="space-y-8 animate-fade-up">
      <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>
      <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <Avatar name={user.name ?? user.email} size="xl" />
          {isAuthed && !isMe && (
            <Button
              variant={following ? 'outline' : 'primary'}
              onClick={() => following ? unfollow.mutate() : follow.mutate()}
              loading={follow.isPending || unfollow.isPending}
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name ?? 'Unnamed'}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
          {user.createdAt && <p className="text-xs text-neutral-400 mt-1">Joined {formatDate(user.createdAt)}</p>}
        </div>
        <div className="flex items-center gap-6 pt-2 border-t border-neutral-50 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="font-semibold">{compactNumber(user.followerCount ?? 0)}</span>
            <span className="text-neutral-500">followers</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold">{compactNumber(user.followingCount ?? 0)}</span>
            <span className="text-neutral-500">following</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-neutral-400" /> Posts
        </h2>
        {postsLoading ? (
          <div className="space-y-4">{[1, 2].map(i => <PostCardSkeleton key={i} />)}</div>
        ) : feedData?.items.length === 0 ? (
          <EmptyState title="No posts yet" message={isMe ? 'Share your first thought!' : "This user hasn't posted yet"} />
        ) : (
          <div className="space-y-4">
            {feedData?.items.map((post: FeedItem) => (
              <PostCard key={post.id} post={post} likedByMe={post.likedByMe} />
            ))}
            <div ref={sentinelRef} className="h-2" />
            {isFetchingNextPage && <div className="flex justify-center py-2"><Spinner className="h-4 w-4" /></div>}
          </div>
        )}
      </div>
    </div>
  );
}
