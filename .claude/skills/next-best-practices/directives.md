# Next.js Directives

## Available Directives

Next.js supports the following directives (all must appear at the **top of the file** before any imports):

| Directive | Where | Purpose |
|---|---|---|
| `'use client'` | Component files | Marks a Client Component boundary |
| `'use server'` | Action files or inline in Server Components | Marks Server Actions |
| `'use cache'` | Component, function, or file scope | Caches result (New Cache Component model) |
| `'use cache: private'` | Same as above | Browser-memory only, per-user cache (Next.js 16+) |
| `'use cache: remote'` | Same as above | Durable, remote cache handler (Next.js 16+) |

---

## `'use client'`

Marks file/component as a Client Component. Enables browser APIs, React hooks (`useState`, `useEffect`, etc.), and event handlers.

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Rules:**
- Place at the top of the file, before any imports
- Only needed at the boundary — child components automatically become client
- Cannot import Server Components from inside a `'use client'` file
- Cannot use server-only APIs (`cookies`, `headers`, DB calls) inside

---

## `'use server'`

Marks exported async functions as **Server Actions** — callable from Client Components via form actions or `startTransition`.

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}
```

Can also be used inline inside a Server Component:

```tsx
// Server Component — no 'use client' needed
export default function Page() {
  async function save(formData: FormData) {
    'use server'
    await db.save(formData)
  }
  return <form action={save}>...</form>
}
```

**Security (Next.js 15+):**
- Unused Server Actions are dead-code eliminated — their IDs are not exposed to the client bundle
- Next.js creates **non-deterministic, unguessable** action IDs that are periodically recalculated between builds

---

## `'use cache'` (Next.js 15+ Cache Components model)

New directive to cache the output of a component, async function, or an entire module. Works alongside `cacheLife()` and `cacheTag()` helpers.

```tsx
// Cache a whole component
'use cache'

export async function BlogPosts() {
  const posts = await db.post.findMany()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

```tsx
// Cache a specific function only
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

export async function getUser(id: string) {
  'use cache'
  cacheLife('hours') // use a named profile
  cacheTag(`user-${id}`) // tag for invalidation
  return db.user.findUnique({ where: { id } })
}
```

**Scope:**
- **File-level** (`'use cache'` at top): caches every exported function in the file
- **Function-level** (inside a function body): caches only that function
- **Async Server Components**: works directly on the component

**`cacheLife()` built-in profiles:**

| Profile | `stale` | `revalidate` | `expire` |
|---|---|---|---|
| `'seconds'` | 0 | 1s | 1s |
| `'minutes'` | 0 | 1m | 1m |
| `'hours'` | 0 | 1h | 1h |
| `'days'` | 0 | 1d | 1d |
| `'weeks'` | 0 | 1w | 1w |
| `'max'` | 30d | 30d | 1yr |

Custom profiles can be defined in `next.config.ts` under `cacheLife`.

**Enable in `next.config.ts`:**
```ts
import type { NextConfig } from 'next'
const config: NextConfig = {
  experimental: { cacheComponents: true } // Next.js 15
  // cacheComponents: true // Next.js 16+
}
export default config
```

---

## `'use cache: private'`

Same as `'use cache'` but sets `Cache-Control: private` on the HTTP response — CDNs will not cache the result, only the browser/user will.

Use for **user-specific data** that should be cached client-side but not on shared CDN caches.

```tsx
'use cache: private'

export async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })
  return <div>{user?.name}</div>
}
```

---

## `'use cache: remote'`

Stores the cache entry in an external **remote cache handler** (configured in `next.config.ts` under `cacheHandlers`). Used for distributed deployments where multiple instances share a cache.

```tsx
'use cache: remote'

export async function GlobalSettings() {
  const settings = await db.settings.findFirst()
  return <div>{settings?.siteName}</div>
}
```

---

## Decision Guide

```
Need browser APIs/hooks?         ➜ 'use client'
Calling DB/secrets from client?  ➜ 'use server' (Server Action)
Cache RSC/function output?       ➜ 'use cache'
User-personalized cached data?   ➜ 'use cache: private'
Shared multi-instance cache?     ➜ 'use cache: remote'
```

---

## Common Mistakes

- **Don't** use `'use client'` and `'use server'` in the same file
- **Don't** mix `'use cache'` with request-time dynamic functions (`cookies()`, `headers()`) — these force dynamic rendering and break caching
- **Do** call `cacheTag()` and `cacheLife()` at the **top** of a `'use cache'` function before any awaits
- **Don't** use `'use cache'` on client components — it only works on server-side code
