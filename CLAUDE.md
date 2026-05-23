# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack → http://localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm type-check   # TypeScript check (tsc --noEmit)
```

There are no tests in this project. Type-checking (`pnpm type-check`) is the primary correctness gate.

## Environment

Copy `.env.local.example` → `.env.local`. The only variable is `NEXT_PUBLIC_API_URL` (default: `http://localhost:4000/api`). The backend is the [x-socials](https://github.com/codedsultan/x-socials) Node.js API.

## Architecture

### Route groups

- `(auth)/` — unauthenticated layout (login, register)
- `(main)/` — sidebar layout requiring auth (feed, posts, users, search)

### Module layout

Each feature lives in `src/modules/<feature>/` with two sub-folders:
- `components/` — React components
- `hooks/` — TanStack Query hooks (all data fetching lives here)

Shared code (`src/shared/`) is the only place modules should import from each other.

### Data layer

All API calls go through `src/shared/lib/api.ts` — a `ky` instance that:
- Attaches `Authorization: Bearer <token>` on every request via `beforeRequest`
- On 401: silently refreshes tokens and replays the original request (deduplicates concurrent refreshes)
- On 403 with `suspended` in the error: clears auth and redirects to `/login?reason=suspended`
- Extracts the `error` field from JSON error bodies so `err.message` is human-readable

**Never call `ky` directly — always use the `api` export.**

### State

Zustand is used only for auth (`src/modules/auth/store.ts`), persisted to `localStorage` under key `x-socials-auth`. All server state is in TanStack Query.

### Query keys

All cache keys are defined in `src/shared/lib/query-keys.ts`. Always use this factory (e.g. `queryKeys.posts.detail(id)`) — never inline string arrays — so invalidation is predictable.

### Pagination patterns

| Data | Strategy | Hook |
|---|---|---|
| Feed / user timeline | Cursor (`nextCursor`) | `useInfiniteQuery` + `IntersectionObserver` auto-load |
| Comments / replies | Keyset (`?after=<id>`) | `useInfiniteQuery` with manual "load more" |
| Users list | Offset (`page`) | `useQuery` |
| Post search | Offset (`page`) | `useQuery` |

### Middleware (`src/proxy.ts`)

Route protection is done in Next.js middleware. Protected routes (`/feed`, `/posts`, `/users`, `/search`) check for a `x-socials-authed=1` cookie. Auth-only routes (`/login`, `/register`) redirect authed users to `/feed`. The cookie is a lightweight signal only — JWT validation happens on the API.

### Notifications

Notifications poll every 30 seconds (`refetchInterval: 30_000`) — there are no websockets. The unread count (`useUnreadCount`) and the full list (`useNotifications`) are separate queries so the bell badge can update independently.

### UI components

Radix UI primitives are wrapped in `src/shared/components/ui/`. Use these rather than importing from `@radix-ui` directly. Tailwind utility merging goes through `cn()` from `src/shared/lib/utils.ts`.

### Types

`src/shared/types/api.ts` mirrors the backend response shapes exactly. All API responses are wrapped in `ApiSuccess<T>` (`{ success: true, data: T }`). Paginated responses are `ApiSuccess<PagedResult<T>>`.
