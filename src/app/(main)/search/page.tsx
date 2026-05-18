import { SearchContent } from '@/modules/search/search-content';
import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Explore</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Search posts by tag</p>
        </div>
        <div className="h-32 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}