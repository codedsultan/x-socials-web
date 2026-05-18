'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Reply, Trash2, ChevronDown } from 'lucide-react';
import { Avatar, Spinner } from '@/shared/components/ui/primitives';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/input';
import { useComments, useReplies, useCreateComment, useDeleteComment } from '../hooks/use-comments';
import { useAuthStore } from '@/modules/auth/store';
import { usePostAuthor } from '@/modules/users/hooks/use-post-author';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { timeAgo } from '@/shared/lib/utils';
import type { Comment } from '@/shared/types/api';

const schema = z.object({ content: z.string().min(1).max(2000) });
type FormValues = z.infer<typeof schema>;

// ─── Single comment row ───────────────────────────────────────────────────────

function CommentRow({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const myUserId = useAuthStore((s) => s.user?.id);
  const isAuthor = myUserId === comment.authorId;
  const author = usePostAuthor(comment.authorId);
  const deleteComment = useDeleteComment(postId);
  const createComment = useCreateComment(postId);
  const repliesQuery = useReplies(showReplies ? comment.id : '');

  const { register, handleSubmit, reset, formState: { errors: _errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onReply(values: FormValues) {
    await createComment.mutateAsync({ content: values.content, parentId: comment.id });
    reset();
    setShowReplyForm(false);
    setShowReplies(true);
  }

  return (
    <div className={depth > 0 ? 'ml-8 pl-4 border-l-2 border-neutral-100 dark:border-neutral-800' : ''}>
      <div className="flex gap-3 py-3 group">
        <Avatar name={comment.authorId} size="sm" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {author.name}
            </span>
            <span className="text-xs text-neutral-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {comment.content}
          </p>
          <div className="flex items-center gap-2">
            {myUserId && depth === 0 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-brand-500 transition-colors"
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => deleteComment.mutate(comment.id)}
                className="flex items-center gap-1 text-xs text-neutral-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <form onSubmit={handleSubmit(onReply)} className="flex gap-2 pt-1">
              <Textarea
                placeholder="Write a reply…"
                className="min-h-[60px] text-sm"
                {...register('content')}
              />
              <div className="flex flex-col gap-1">
                <Button type="submit" size="sm" loading={createComment.isPending}>Post</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {/* Load replies toggle */}
          {!comment.parentId && depth === 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
              {showReplies ? 'Hide replies' : 'View replies'}
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && repliesQuery.data?.items.map((reply) => (
        <CommentRow key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}
    </div>
  );
}

// ─── CommentThread (main export) ──────────────────────────────────────────────

export function CommentThread({ postId }: { postId: string }) {
  const isAuthed = useAuthStore((s) => s.isAuthed());
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useComments(postId);

  const createComment = useCreateComment(postId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onComment(values: FormValues) {
    await createComment.mutateAsync({ content: values.content });
    reset();
  }

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore);

  return (
    <section id="comments" className="space-y-4">
      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Comments</h3>

      {/* Compose */}
      {isAuthed && (
        <form onSubmit={handleSubmit(onComment)} className="flex gap-3">
          <Textarea
            placeholder="Add a comment…"
            className="min-h-[72px]"
            error={errors.content?.message}
            {...register('content')}
          />
          <Button type="submit" loading={createComment.isPending} className="self-end">Post</Button>
        </form>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner className="h-5 w-5" /></div>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {data?.items.map((comment) => (
            <CommentRow key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-2" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-2"><Spinner className="h-4 w-4" /></div>
      )}
    </section>
  );
}
