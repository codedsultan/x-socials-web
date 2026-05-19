'use client';

import { useSearchParams } from 'next/navigation';

export function useSafeRedirect(fallback = '/feed'): string {
    const params = useSearchParams();
    const redirect = params.get('redirect') ?? '';
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        return redirect;
    }
    return fallback;
}