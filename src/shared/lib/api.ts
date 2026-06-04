import ky, { type KyInstance, HTTPError } from 'ky';
import type { ApiSuccess, AuthTokens } from '@/shared/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function getAuthStore() {
  const { useAuthStore } = await import('@/modules/auth/store');
  return useAuthStore.getState();
}

// ─── Token refresh (deduplicated) ────────────────────────────────────────────

let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const store = await getAuthStore();
    if (!store.refreshToken) throw new Error('No refresh token');

    const res = await ky
      .post(`${BASE_URL}/auth/refresh`, { json: { refreshToken: store.refreshToken } })
      .json<ApiSuccess<{ tokens: AuthTokens }>>();

    store.setTokens(res.data.tokens);
    return res.data.tokens;
  })().finally(() => { refreshPromise = null; });

  return refreshPromise;
}

// ─── ky instance ──────────────────────────────────────────────────────────────

export const api: KyInstance = ky.create({
  prefix: BASE_URL,
  timeout: 30_000,
  retry: { limit: 0 },

  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const store = await getAuthStore();
        if (store.accessToken) {
          request.headers.set('Authorization', `Bearer ${store.accessToken}`);
        }
      },
    ],

    afterResponse: [
      async ({ request, response }) => {
        if (response.status === 403) {
          try {
            const body = await response.clone().json() as { error?: string };
            if (body.error?.toLowerCase().includes('suspended')) {
              const store = await getAuthStore();
              store.clearAuth();
              if (typeof window !== 'undefined') {
                window.location.href = '/login?reason=suspended';
              }
              return response;
            }
          } catch { /* non-JSON 403 */ }
        }

        if (response.status !== 401) return response;

        const store = await getAuthStore();
        if (!store.refreshToken) {
          store.clearAuth();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return response;
        }

        try {
          const tokens = await refreshTokens();
          const retried = request.clone();
          retried.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
          return fetch(retried);
        } catch {
          store.clearAuth();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return response;
        }
      },
    ],

    beforeError: [
      async ({ error }) => {
        if (error && typeof error === 'object' && 'response' in error) {
          const kyError = error as { response: Response; message: string };
          try {
            const body = await kyError.response.clone().json() as { error?: string };
            error.message = body.error ?? kyError.response.statusText;
          } catch { /* non-JSON */ }
        }
        return error;
      },
    ],
  },
});

// ─── Error helper ─────────────────────────────────────────────────────────────

export async function getApiError(err: unknown): Promise<string> {
  if (err instanceof HTTPError) {
    try {
      const body = await err.response.clone().json() as { error?: string };
      return body.error ?? err.message;
    } catch {
      return err.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
