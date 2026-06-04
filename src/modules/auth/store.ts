'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CurrentUser, AuthTokens } from '@/shared/types/api';

interface AuthState {
  user: CurrentUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (user: CurrentUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setEmailVerified: () => void;   // mark email as verified locally
  clearAuth: () => void;
  isAuthed: () => boolean;
  isEmailVerified: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, tokens) =>
        set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),

      setTokens: (tokens) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),

      // Called after a successful POST /auth/email/verify
      setEmailVerified: () =>
        set((state) => ({
          user: state.user ? { ...state.user, emailVerifiedAt: new Date().toISOString() } : null,
        })),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      isAuthed: () => {
        const { user, accessToken } = get();
        return !!user && !!accessToken;
      },

      isEmailVerified: () => {
        return !!get().user?.emailVerifiedAt;
      },
    }),
    {
      name: 'x-socials-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
