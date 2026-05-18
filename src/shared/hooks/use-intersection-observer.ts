'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `onIntersect` when the referenced element enters the viewport.
 * Used to trigger infinite scroll next-page fetches.
 */
export function useIntersectionObserver(
  onIntersect: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onIntersect();
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, options]);

  return ref;
}
