# X-Socials Web

Next.js frontend for the [x-socials](https://github.com/codedsultan/x-socials) API.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 16 (App Router) |
| Data fetching | TanStack Query v5 |
| State | Zustand (auth slice only) |
| HTTP | ky (Bearer token injection, silent 401 refresh) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + Radix UI primitives |
| Icons | Lucide React |
| Theme | next-themes |

---

## Getting Started

```bash
# 1. Install deps
pnpm install

# 2. Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL defaults to http://localhost:4000/api

# 3. Start the backend (in x-socials/)
pnpm dev

# 4. Start the frontend
pnpm dev
# → http://localhost:3000
```

---

## Project Structure

```
src/
  app/
    (auth)/                    # Unauthenticated layout
      login/
      register/
      forgot-password/         # Request password reset OTP
      reset-password/          # Submit OTP + new password
      verify-email/            # Submit email verification OTP (protected)
    (main)/                    # Sidebar layout — requires auth cookie
      feed/
      posts/[id]/
      users/[id]/
      search/
    layout.tsx                 # Root layout with providers
    providers.tsx              # QueryClient + ThemeProvider

  middleware.ts                # Next.js middleware entry — re-exports proxy.ts

  modules/
    auth/
      components/
        auth-forms.tsx         # LoginForm, RegisterForm, ForgotPasswordForm,
        │                      # ResetPasswordForm, VerifyEmailForm
        email-verification-banner.tsx  # Amber nudge for unverified users
        suspension-banner.tsx
      hooks/
        use-auth.ts            # useLogin, useRegister, useLogout, useMe,
                               # useRequestEmailVerification, useVerifyEmail,
                               # useForgotPassword, useResetPassword
      store.ts                 # Zustand auth slice (persisted to localStorage)
    feed/
      hooks/use-feed.ts        # useHomeFeed, useUserFeed (cursor infinite scroll)
    posts/
      hooks/use-posts.ts       # usePost, usePosts, useCreatePost, useUpdatePost, useDeletePost
    comments/
      hooks/use-comments.ts    # useComments, useReplies, useCreateComment, useDeleteComment
    likes/
      hooks/use-likes.ts       # useToggleLike (optimistic)
    users/
      hooks/use-users.ts       # useUser, useUsers, useFollow, useFollowers, useFollowing
    notifications/
      hooks/use-notifications.ts  # useNotifications, useUnreadCount (polls every 30s)

  shared/
    components/
      ui/                      # Button, Input, Textarea, Avatar, Skeleton, Badge, EmptyState
      sidebar.tsx              # Desktop nav + compose modal; shows name + email
      mobile-nav.tsx           # Bottom tab bar
    hooks/
      use-intersection-observer.ts   # Infinite scroll trigger
      use-auth-cookie.ts             # Syncs auth state → cookie for middleware
      use-safe-redirect.ts           # Validates redirect param before use
    lib/
      api.ts                   # ky instance — auth injection, 401 refresh, error extraction
      query-keys.ts            # Centralised cache key factory
      query-client.ts
      utils.ts                 # cn, timeAgo, formatDate, compactNumber, initials
    types/
      api.ts                   # TypeScript types mirroring backend exactly
  proxy.ts                     # Middleware logic — route protection + auth redirects
```

---

## Auth Flows

### Login / Register
1. User submits form → `useLogin` / `useRegister` mutation
2. Backend returns `{ user: { id, name, email }, tokens }`
3. `store.setAuth(user, tokens)` persists to localStorage
4. `use-auth-cookie` syncs a `x-socials-authed=1` cookie for middleware
5. User is redirected to `/feed`

After registration the backend sends an email verification OTP automatically — a toast hints the user to check their inbox.

### Token refresh
Every request attaches `Authorization: Bearer <accessToken>` via ky's `beforeRequest` hook. On 401, the `afterResponse` hook calls `POST /auth/refresh`, stores new tokens, and replays the original request. Concurrent 401s share a single refresh promise to avoid duplicate calls. On refresh failure, `clearAuth()` is called and the user is redirected to `/login`.

### Email verification
- Unverified users see an amber banner on all `(main)` pages with a one-click "Resend code" button.
- Navigating to `/verify-email` submits the 6-digit code via `useVerifyEmail`.
- On success, `store.setEmailVerified()` updates `emailVerifiedAt` in the store and the banner disappears.

### Password reset
1. `/forgot-password` — user enters email, `useForgotPassword` calls `POST /auth/password/forgot`. Always shows success (prevents enumeration).
2. `/reset-password` — user enters email + OTP code + new password, `useResetPassword` calls `POST /auth/password/reset`. On success redirects to `/login`.

---

## Route Protection

`src/middleware.ts` re-exports the logic from `src/proxy.ts`. The middleware checks for the `x-socials-authed` cookie (a lightweight signal — real JWT validation happens on the API).

| Route group | Behaviour |
|-------------|-----------|
| `/feed`, `/posts`, `/users`, `/search`, `/verify-email` | Redirect to `/login?redirect=<path>` if not authed |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Redirect to `/feed` if already authed |

---

## Data Layer

**Never call `ky` directly** — always use the `api` export from `src/shared/lib/api.ts`.

All cache keys live in `src/shared/lib/query-keys.ts`. Always use the factory (e.g. `queryKeys.posts.detail(id)`) — never inline string arrays.

### Pagination patterns

| Data | Strategy | UI behaviour |
|------|----------|-------------|
| Feed / user timeline | Cursor (`nextCursor`) | `useInfiniteQuery` + `IntersectionObserver` — auto-loads |
| Comments / replies | Keyset (`?after=<id>`) | `useInfiniteQuery` with manual "load more" |
| Users list | Offset (`page`) | Page buttons |
| Post search | Offset (`page`) | Previous / Next buttons |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Dev server with Turbopack → `http://localhost:3000` |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm type-check` | `tsc --noEmit` — primary correctness gate |

There are no automated tests — `pnpm type-check` is the correctness gate.

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api   # Default — change if API runs elsewhere
```

---

## Test Credentials

After running `pnpm db:seed` on the backend. All seed users share the password **SeedPass123**.

| Email | Relationships |
|-------|---------------|
| `alice@example.com` | Followed by bob, charlie, diana |
| `bob@example.com` | Follows alice |
| `charlie@example.com` | Follows alice + bob |
| `diana@example.com` | Follows alice |

---

## Related Services

| Service | Role |
|---------|------|
| [x-socials](https://github.com/codedsultan/x-socials) | Node.js API — content source |
| [x-socials-admin](https://github.com/codedsultan/x-socials-admin) | Laravel admin panel — review queue, dashboard |
| [x-socials-moderator](https://github.com/codedsultan/x-socials-ai-moderator) | FastAPI AI moderation engine |

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Author

**Olusegun Ibraheem**
- Website: [codesultan.xurl.fyi](https://codesultan.xurl.fyi)
- Email: codesultan369@gmail.com
