'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input, Textarea } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/primitives';
import { useUpdatePost } from '../hooks/use-posts';
import { toast } from '@/shared/components/ui/toast';
import type { Post } from '@/shared/types/api';

const schema = z.object({
  title:   z.string().min(3).max(200),
  content: z.string().min(1).max(10_000),
});

type FormValues = z.infer<typeof schema>;

interface EditPostModalProps {
  post:      Post;
  onClose:   () => void;
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const [tags, setTags]       = useState<string[]>(post.tags);
  const [tagInput, setTagInput] = useState('');
  const updatePost = useUpdatePost(post.id);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: post.title, content: post.content },
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]);
      setTagInput('');
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await updatePost.mutateAsync({ ...values, tags });
      toast.success('Post updated');
      onClose();
    } catch {
      toast.error('Could not update post');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 space-y-4 animate-slide-in">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Edit Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Textarea label="Content" className="min-h-[140px]" error={errors.content?.message} {...register('content')} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tags</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 min-h-[42px] bg-white dark:bg-neutral-900">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? 'Add tags…' : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={updatePost.isPending}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
