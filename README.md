# X-Socials Web

Next.js 16 frontend for the x-socials API.

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Data fetching | TanStack Query v5 |
| State | Zustand (auth slice only) |
| HTTP | ky (with silent token refresh) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + Radix UI primitives |
| Icons | Lucide React |
| Theme | next-themes |

## Getting started

```bash
# 1. Install deps
npm install

# 2. Set your API URL
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if your API runs on a different port

# 3. Start the backend (in x-socials/)
pnpm dev

# 4. Start the frontend
npm run dev
# → http://localhost:3000
```

## Project structure

```
src/
  app/
    (auth)/          # login, register — unauthenticated layout
    (main)/          # feed, posts, users, search — sidebar layout
    layout.tsx       # root layout with providers
    providers.tsx    # QueryClient + ThemeProvider

  modules/
    auth/
      components/    # LoginForm, RegisterForm
      hooks/         # useLogin, useRegister, useLogout, useMe
      store.ts       # Zustand auth slice (persisted to localStorage)
    feed/
      components/    # FeedList (infinite scroll)
      hooks/         # useHomeFeed, useUserFeed
    posts/
      components/    # PostCard, CreatePostForm
      hooks/         # usePost, usePosts, useCreatePost, useUpdatePost, useDeletePost
    comments/
      components/    # CommentThread (keyset infinite + replies)
      hooks/         # useComments, useReplies, useCreateComment, useDeleteComment
    likes/
      hooks/         # useToggleLike (optimistic)
    users/
      components/    # (UserCard, FollowButton — extend here)
      hooks/         # useUser, useUsers, useFollow, useFollowers, useFollowing

  shared/
    components/
      ui/            # Button, Input, Textarea, Avatar, Skeleton, Badge, EmptyState
      sidebar.tsx    # Navigation sidebar with compose modal
    hooks/
      use-intersection-observer.ts  # Infinite scroll trigger
    lib/
      api.ts         # ky instance — attaches Bearer token, refreshes on 401
      query-client.ts
      query-keys.ts  # Centralised cache key factory
      utils.ts       # cn, timeAgo, formatDate, compactNumber, initials, avatarUrl
    types/
      api.ts         # TypeScript types mirroring backend exactly
```

## Pagination patterns

| Endpoint | Strategy | How it works in the UI |
|---|---|---|
| Feed | Cursor | `useInfiniteQuery` + `IntersectionObserver` — auto-loads next page as you scroll |
| Post timeline | Cursor | Same pattern |
| Comments | Keyset | `useInfiniteQuery` with `?after=<id>` — "load more" at bottom of thread |
| Replies | Keyset | Same — expand on demand per comment |
| Users list | Offset | `useQuery` with page buttons |
| Post search | Offset | `useQuery` with Previous / Next buttons |

## Authentication flow

1. User logs in → tokens stored in Zustand (persisted to localStorage)
2. Every request: ky `beforeRequest` hook attaches `Authorization: Bearer <token>`
3. On 401: `afterResponse` hook calls `/auth/refresh`, stores new tokens, replays original request
4. On refresh failure: `clearAuth()` + redirect to `/login`

## Test credentials (after `pnpm db:seed` on the backend)

All seed users share the password **SeedPass123**

- `alice@example.com` — followed by bob, charlie, diana
- `bob@example.com` — follows alice
- `charlie@example.com` — follows alice + bob
- `diana@example.com` — follows alice


## Related services

| Service | Role |
|---|---|
| [x-socials](https://github.com/codedsultan/x-socials) | Node.js social platform backend API — content source |
| [x-socials-admin](https://github.com/codedsultan/x-socials-admin) | Laravel admin panel — review queue, dashboard, auto-remove |
| [x-socials-moderator](https://github.com/codedsultan/x-socials-ai-moderator) | FastAPI AI engine — analyses content, writes results |

---

## License

MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Olusegun Ibraheem**
- Website: [codesultan.xurl.fyi](https://codesultan.xurl.fyi)
- Email: codesultan369@gmail.com
