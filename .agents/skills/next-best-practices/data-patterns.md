# Next.js Data Fetching Patterns

## Golden Rules (Next.js 15+)

1. **Fetch in Server Components** — no useEffect, no client-side fetch for initial data
2. **`params` and `searchParams` are async** — always `await` them
3. **GET route handlers are NOT cached by default** — opt in explicitly with `export const dynamic = 'force-static'`
4. **`fetch()` is NOT cached by default** — Next.js 15 removed automatic caching; use `'use cache'` directive or cache options

---

## Server Component Data Fetching

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  // Direct DB query (no API round-trip needed)
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } })
  return <PostList posts={posts} />
}
```

```tsx
// With fetch (no cache by default in Next.js 15+)
const res = await fetch('https://api.example.com/posts')
const posts = await res.json()

// Opt into caching with fetch
const res = await fetch('https://api.example.com/posts', {
  cache: 'force-cache',    // cache indefinitely
  next: { revalidate: 60 } // ISR — revalidate every 60s
})

// Opt out of caching explicitly
const res = await fetch('https://api.example.com/data', { cache: 'no-store' })
```

---

## New Cache Model — `'use cache'` Directive

**Preferred approach** in Next.js 15+. Replaces `unstable_cache` and fetch cache options.

```tsx
// Cache an async function
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

async function getPosts() {
  'use cache'
  cacheLife('hours')           // revalidate every hour
  cacheTag('posts')            // tag for manual invalidation
  return db.post.findMany()
}

// Cache an entire Server Component
'use cache'

export default async function PostList() {
  cacheLife('days')
  const posts = await db.post.findMany()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

**Invalidate tagged caches:**
```ts
'use server'

import { revalidateTag } from 'next/cache'

export async function invalidatePosts() {
  revalidateTag('posts')
}
```

**Enable Cache Components** in `next.config.ts`:
```ts
const config: NextConfig = {
  experimental: { cacheComponents: true } // Next.js 15
  // cacheComponents: true // Next.js 16+
}
```

**`use cache` modifiers (Next.js 16+):**
- `'use cache'`: In-memory server side cache.
- `'use cache: remote'`: Stores in a remote cache handler (Redis/etc).
- `'use cache: private'`: Per-user cache stored only in the browser memory.

---

## Previous Cache Model — `unstable_cache`

Still works. For projects not yet on the new Cache Component model.

```ts
import { unstable_cache } from 'next/cache'

const getCachedPosts = unstable_cache(
  async () => db.post.findMany(),
  ['posts'],
  {
    tags: ['posts'],
    revalidate: 3600, // seconds
  }
)
```

---

## Parallel Data Fetching

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // ✅ Start all fetches together
  const [user, posts, settings] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    getSettings(),
  ])

  return <Dashboard user={user} posts={posts} settings={settings} />
}
```

---

## Sequential Data Fetching

Only when one fetch depends on the result of another:

```tsx
const user = await getUser(id)
const org = await getOrg(user.orgId) // depends on user
```

---

## Streaming with Suspense

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <HeroSection />           {/* renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />       {/* streams in when ready */}
      </Suspense>
    </>
  )
}
```

---

## Server Actions — Data Mutations

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string

  // Validate
  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters' }
  }

  await db.post.create({ data: { title } })
  revalidatePath('/posts')
  redirect('/posts')
}
```

**Client Component with `useActionState` (React 19 / Next.js 15+):**

```tsx
'use client'

import { useActionState } from 'react'
import { createPost } from './actions'

export function CreatePostForm() {
  const [state, action, isPending] = useActionState(createPost, null)

  return (
    <form action={action}>
      <input name="title" placeholder="Post title" />
      {state?.error && <p className="error">{state.error}</p>}
      <button disabled={isPending}>{isPending ? 'Saving...' : 'Create'}</button>
    </form>
  )
}
```

**`useFormStatus` hook:**

```tsx
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>
}
```

---

## `<Form>` Component (Next.js 15+)

Extends `<form>` with client-side navigation, prefetching, and progressive enhancement — for forms that navigate to a new page (like search).

```tsx
import Form from 'next/form'

export default function SearchPage() {
  return (
    <Form action="/search">
      <input name="q" />
      <button type="submit">Search</button>
    </Form>
  )
}
```

**Features:**
- Prefetches the target layout/loading UI when the form is in view
- Client-side navigation on submit (preserves shared layouts)
- Falls back to full-page navigation if JS is unavailable

---

## Route Handlers — Data API

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET is NOT cached by default in Next.js 15+
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? 10)
  const posts = await db.post.findMany({ take: limit })
  return NextResponse.json(posts)
}

// Opt into static caching
export const dynamic = 'force-static'
```

---

## ISR — Incremental Static Regeneration

```tsx
// app/posts/page.tsx
export const revalidate = 60 // revalidate every 60 seconds

export default async function Posts() {
  const posts = await db.post.findMany()
  return <PostList posts={posts} />
}
```

**On-demand revalidation:**

```ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function publishPost(id: string) {
  await db.post.update({ where: { id }, data: { published: true } })
  revalidatePath('/posts')        // by path
  revalidateTag('posts')          // by cache tag
}

**Read-Your-Writes with `updateTag` (Next.js 16+):**
Use `updateTag` to extend the freshness of a cache entry after a mutation without a full invalidation.
```ts
import { updateTag } from 'next/cache'

export async function likePost(id: string) {
  'use server'
  await db.post.like(id)
  updateTag(`post-${id}`)
}
```
```

---

## Request Deduplication (React `cache`)

Deduplicate the same data request within a single render pass:

```ts
import { cache } from 'react'

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// Both calls resolve to the same request — no duplicate DB queries
const user1 = await getUser('123')
const user2 = await getUser('123') // served from React cache
```

---

## Draft Mode

Enable preview of unpublished content:

```ts
// app/api/draft/route.ts
import { draftMode } from 'next/headers'

export async function GET() {
  const draft = await draftMode()
  draft.enable()
  return new Response('Draft mode enabled')
}
```

```tsx
// In page.tsx
const { isEnabled } = await draftMode()
const post = await getPost(slug, { preview: isEnabled })
```

---

## Data Fetching Decision Guide

| Use Case | Pattern |
|---|---|
| Initial page data (SSR) | `async` Server Component + direct DB/fetch |
| Cached data | `'use cache'` directive + `cacheLife()` |
| Tagged invalidatable data | `'use cache'` + `cacheTag()` |
| ISR pages | `export const revalidate = N` |
| User mutations | Server Action + `revalidatePath/Tag` |
| Background work after response | `after()` |
| Client-side fetching (after interactions) | `useSWR` or `useQuery` in Client Component |
| API endpoint for external clients | Route Handler |
