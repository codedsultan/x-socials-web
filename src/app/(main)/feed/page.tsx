import type { Metadata } from 'next';
import { FeedList } from '@/modules/feed/components/feed-list';

export const metadata: Metadata = { title: 'Feed' };

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Feed</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Posts from people you follow</p>
      </div>
      <FeedList />
    </div>
  );
}
