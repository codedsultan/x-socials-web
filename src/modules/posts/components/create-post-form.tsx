'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input, Textarea } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
// import { Badge } from '@/shared/components/ui/primitives';
import { useCreatePost } from '../hooks/use-posts';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(1, 'Content is required').max(10_000),
});

type FormValues = z.infer<typeof schema>;

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [apiError, setApiError] = useState('');

  const createPost = useCreatePost();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (t && !tags.includes(t) && tags.length < 10) {
        setTags([...tags, t]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  async function onSubmit(values: FormValues) {
    setApiError('');
    try {
      await createPost.mutateAsync({ ...values, tags });
      reset();
      setTags([]);
      onSuccess?.();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create post');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="What's your post about?"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Content"
        placeholder="Share your thoughts..."
        className="min-h-[140px]"
        error={errors.content?.message}
        {...register('content')}
      />

      {/* Tag input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Tags <span className="text-neutral-400 font-normal">(optional, press Enter to add)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-h-[42px]">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
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

      {apiError && <p className="text-sm text-red-500">{apiError}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" loading={createPost.isPending}>
          Publish Post
        </Button>
      </div>
    </form>
  );
}
