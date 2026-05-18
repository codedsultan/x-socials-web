'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PostCard } from '@/modules/posts/components/post-card';
import { PostCardSkeleton, EmptyState } from '@/shared/components/ui/primitives';
import { usePosts } from '@/modules/posts/hooks/use-posts';
import type { FeedItem } from '@/shared/types/api';

export function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTag = searchParams.get('tag') ?? '';

    const [tag, setTag] = useState(initialTag);
    const [page, setPage] = useState(1);
    const [submitted, setSubmitted] = useState(!!initialTag);

    const { data, isLoading } = usePosts({ tag: submitted ? tag : undefined, page });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        setSubmitted(true);
        router.replace(`/search?tag=${encodeURIComponent(tag)}`, { scroll: false });
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Explore</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Search posts by tag</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                        placeholder="Search by tag (e.g. api, engineering)"
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            {submitted && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">{[1, 2, 3].map(i => <PostCardSkeleton key={i} />)}</div>
                    ) : data?.items.length === 0 ? (
                        <EmptyState
                            title={`No posts tagged "${tag}"`}
                            message="Try a different tag"
                        />
                    ) : (
                        <>
                            <p className="text-sm text-neutral-500">
                                {data?.meta.total ?? 0} posts tagged <strong className="text-neutral-700 dark:text-neutral-300">#{tag}</strong>
                            </p>

                            <div className="space-y-4">
                                {data?.items.map((post) => (
                                    <PostCard key={post.id} post={post as FeedItem} />
                                ))}
                            </div>

                            {/* Offset pagination */}
                            {(data?.meta.totalPages ?? 0) > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-neutral-500">
                                        Page {page} of {data?.meta.totalPages}
                                    </span>
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={!data?.meta.hasMore}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}