'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/modules/auth/store';

/**
 * Sets / clears a lightweight cookie (`x-socials-authed=1`) whenever the
 * auth store changes. The middleware reads this cookie to decide whether to
 * redirect unauthenticated requests — it cannot read localStorage directly
 * because middleware runs on the server/edge.
 *
 * This is intentionally a non-httpOnly, non-sensitive cookie. It carries no
 * credentials — it is purely a "logged-in signal". The real tokens stay in
 * localStorage and are attached to requests by the ky interceptor.
 */
export function useAuthCookie() {
  const isAuthed = useAuthStore((s) => s.isAuthed());

  useEffect(() => {
    if (isAuthed) {
      document.cookie = 'x-socials-authed=1; path=/; SameSite=Lax; max-age=2592000';
    } else {
      document.cookie = 'x-socials-authed=; path=/; SameSite=Lax; max-age=0';
    }
  }, [isAuthed]);
}
