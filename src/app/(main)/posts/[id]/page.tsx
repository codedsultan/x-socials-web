'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { Avatar, Spinner, EmptyState, Badge } from '@/shared/components/ui/primitives';
// import { Button } from '@/shared/components/ui/button';
import { CommentThread } from '@/modules/comments/components/comment-thread';
import { usePost } from '@/modules/posts/hooks/use-posts';
import { usePostAuthor } from '@/modules/users/hooks/use-post-author';
import { useToggleLike } from '@/modules/likes/hooks/use-likes';
import { useAuthStore } from '@/modules/auth/store';
import { toast } from '@/shared/components/ui/toast';
import { timeAgo, compactNumber, cn } from '@/shared/lib/utils';

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const isAuthed = useAuthStore((s) => s.isAuthed());

  const { data: post, isLoading, isError } = usePost(id);
  const author = usePostAuthor(post?.authorId ?? '');
  const toggleLike = useToggleLike();

  // Track local liked state — the feed optimistic update doesn't apply here
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | null>(null);

  // Sync local state once post loads
  const displayLikes = likesCount ?? post?.likesCount ?? 0;

  function handleLike() {
    if (!post) return;
    if (!isAuthed) {
      toast.info('Sign in to like posts');
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(displayLikes + (nextLiked ? 1 : -1));

    toggleLike.mutate(
      { targetId: post.id, targetType: 'post', currentlyLiked: liked },
      {
        onError: () => {
          // Roll back
          setLiked(liked);
          setLikesCount(displayLikes);
          toast.error('Could not update like');
        },
      }
    );
  }

  if (isLoading) return (
    <div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>
  );

  if (isError || !post) return (
    <EmptyState title="Post not found" message="This post may have been deleted" />
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <article className="space-y-6">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Link href={`/users/${post.authorId}`}>
            <Avatar name={author.name} size="md" />
          </Link>
          <div>
            <Link
              href={`/users/${post.authorId}`}
              className="text-sm font-semibold hover:underline text-neutral-800 dark:text-neutral-200"
            >
              {author.name}
            </Link>
            <p className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* Content */}
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap text-[15px]">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/search?tag=${tag}`}>
                <Badge variant="brand">#{tag}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Like action */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
              liked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-neutral-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
              !isAuthed && 'cursor-default'
            )}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={cn('h-4 w-4 transition-transform duration-150', liked && 'fill-current scale-110')} />
            {compactNumber(displayLikes)} {displayLikes === 1 ? 'like' : 'likes'}
          </button>
        </div>
      </article>

      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-8">
        <CommentThread postId={id} />
      </div>
    </div>
  );
}
