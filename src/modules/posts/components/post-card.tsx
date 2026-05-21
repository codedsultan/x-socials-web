'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Trash2, Edit } from 'lucide-react';
import { Avatar, Badge } from '@/shared/components/ui/primitives';
import { Button } from '@/shared/components/ui/button';
import { useToggleLike } from '@/modules/likes/hooks/use-likes';
import { useDeletePost } from '@/modules/posts/hooks/use-posts';
import { usePostAuthor } from '@/modules/users/hooks/use-post-author';
import { useAuthStore } from '@/modules/auth/store';
import { toast } from '@/shared/components/ui/toast';
import { cn, timeAgo, compactNumber } from '@/shared/lib/utils';
import type { FeedItem, Post } from '@/shared/types/api';

interface PostCardProps {
  post:       FeedItem | Post;
  likedByMe?: boolean;
  onEdit?:    () => void;
  className?: string;
}

export function PostCard({ post, likedByMe = false, onEdit, className }: PostCardProps) {
  const myUserId  = useAuthStore((s) => s.user?.id);
  const isAuthor  = myUserId === post.authorId;
  const isAuthed  = useAuthStore((s) => s.isAuthed());

  const author     = usePostAuthor(post.authorId);
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();

  const liked      = 'likedByMe' in post ? post.likedByMe : likedByMe;
  const isPending  = toggleLike.isPending;
  const isDeleting = deletePost.isPending;

  function handleLike() {
    if (!isAuthed) {
      toast.info('Sign in to like posts');
      return;
    }
    toggleLike.mutate(
      { targetId: post.id, targetType: 'post', currentlyLiked: liked },
      {
        onError: () => toast.error('Could not update like', 'Please try again'),
      }
    );
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    deletePost.mutate(post.id, {
      onSuccess: () => toast.success('Post deleted'),
      onError:   () => toast.error('Could not delete post'),
    });
  }

  // Soft-deleted — render a tombstone instead of the full card
  if (post.deletedAt) {
    return (
      <article className={cn(
        'rounded-2xl border border-neutral-100 dark:border-neutral-800',
        'bg-white/50 dark:bg-neutral-900/50 p-5',
        className,
      )}>
        <p className="text-sm text-neutral-400 dark:text-neutral-600 italic">
          This post has been removed.
        </p>
      </article>
    );
  }

  return (
    <article className={cn(
      'group rounded-2xl border border-neutral-100 dark:border-neutral-800',
      'bg-white dark:bg-neutral-900',
      'p-5 space-y-4 transition-shadow duration-200',
      'hover:shadow-md hover:shadow-neutral-100 dark:hover:shadow-neutral-900/50',
      'animate-fade-up',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link href={`/users/${post.authorId}`} className="flex items-center gap-3 min-w-0">
          <Avatar name={author.name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate hover:underline">
              {author.name}
            </p>
            <p className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit post">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost" size="icon"
              onClick={handleDelete}
              loading={isDeleting}
              aria-label="Delete post"
              className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Link href={`/posts/${post.id}`} className="block group/title">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-[15px] leading-snug group-hover/title:text-brand-600 dark:group-hover/title:text-brand-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 5).map((tag) => (
            <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
              <Badge variant="brand">#{tag}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-neutral-50 dark:border-neutral-800">
        <button
          onClick={handleLike}
          disabled={isPending}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'transition-all duration-150 disabled:opacity-60',
            liked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-neutral-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          )}
        >
          <Heart className={cn('h-4 w-4 transition-transform duration-150', liked && 'fill-current scale-110')} />
          <span>{compactNumber(post.likesCount)}</span>
        </button>

        <Link
          href={`/posts/${post.id}#comments`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Comment</span>
        </Link>
      </div>
    </article>
  );
}
