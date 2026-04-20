# Next.js Async Patterns

## Core Rule (Next.js 15+ / 16)

Request-specific APIs are **async**. In Next.js 15, synchronous access triggers a warning/error. **In Next.js 16+, synchronous access is no longer supported and will throw an error.**

```ts
// ✅ Correct (Required in 16+)
const cookieStore = await cookies()
const headerStore = await headers()
const { isEnabled } = await draftMode()
const { id } = await params   // in layout/page/route
const { q } = await searchParams // in page.js only
```

```ts
// ❌ Error in Next.js 16+
const cookieStore = cookies()
const token = cookieStore.get('token')
```

**Affected APIs:**
- `cookies()` from `next/headers`
- `headers()` from `next/headers`
- `draftMode()` from `next/headers`
- `params` prop in `layout.js`, `page.js`, `route.js`, `default.js`, `generateMetadata`, `generateViewport`
- `searchParams` prop in `page.js`

**Codemod for auto-migration:**
```bash
npx @next/codemod@canary next-async-request-api .
```

---

## Page/Layout Props Pattern

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { slug } = await params
  const { q } = await searchParams

  const post = await getPost(slug)
  return <article>{post.title}</article>
}
```

---

## Server Component Data Fetching

Server Components are `async` by default — `await` anywhere in the component body.

```tsx
// No provider, no useEffect — just async/await
export default async function Page() {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  return <pre>{JSON.stringify(data)}</pre>
}
```

**Parallel data fetching** — start all promises first, then await together:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Start fetches in parallel
  const [user, posts] = await Promise.all([
    getUser(id),
    getPosts(id),
  ])

  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

---

## Sequential vs Parallel Async

```tsx
// Sequential (each waits for previous) — use only when 2nd depends on 1st
const user = await getUser(id)
const org = await getOrg(user.orgId)

// Parallel (both start at same time) — preferred when independent
const [user, settings] = await Promise.all([getUser(id), getSettings()])
```

---

## Server Actions (Async)

Server Actions are async server-side functions callable from the client.

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  
  // Validate
  if (!title) throw new Error('Title is required')

  await db.post.create({ data: { title } })
  revalidatePath('/posts')
  redirect('/posts')
}
```

**Using with `useActionState` (React 19 / Next.js 15+):**

```tsx
'use client'

import { useActionState } from 'react'
import { createPost } from './actions'

export function PostForm() {
  const [state, action, isPending] = useActionState(createPost, null)

  return (
    <form action={action}>
      <input name="title" />
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
}
```

---

## `after()` — Post-Response Work (Stable in Next.js 15+)

Run code **after** the response has been sent (analytics, logging). Does not block the response.

```tsx
import { after } from 'next/server'

export default async function Page() {
  after(async () => {
    // Runs after response is streamed
    await analytics.track('page_view', { page: '/dashboard' })
  })

  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}
```

Works in: **Server Components, Server Actions, Route Handlers, Middleware**

> **Note:** `after()` was `unstable_after` in Next.js 15.0. It is now stable as `after` in later 15.x / 16+ releases.

---

## `connection()` — Opt into Dynamic Rendering

Forces a component to be dynamically rendered (waits for the request) without using `headers()` or `cookies()`.

```tsx
import { connection } from 'next/server'

export default async function Page() {
  await connection() // now this component is always dynamic
  
  const now = new Date().toISOString()
  return <p>Current time: {now}</p>
}
```

---

## Streaming with `Suspense`

Wrap slow async components in `Suspense` to stream content progressively:

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <SlowStats />  {/* async Server Component */}
      </Suspense>
    </div>
  )
}
```

---

## `generateStaticParams` (Async)

```tsx
export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { slug: true } })
  return posts.map(p => ({ slug: p.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.content}</article>
}
```

---

## `generateMetadata` (Async)

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.excerpt,
  }
}
```

---

## Caching Async Requests (Previous Model)

```ts
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { tags: ['user'], revalidate: 3600 }
)
```

> **New model**: Use `'use cache'` directive with `cacheTag()` and `cacheLife()` instead.
