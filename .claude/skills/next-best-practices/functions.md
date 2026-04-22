# Next.js Functions API Reference

## Server-Side Functions

### `cookies()` — async in Next.js 15+

```ts
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  cookieStore.set('theme', 'dark')
  cookieStore.delete('session')
}
```

### `headers()` — async in Next.js 15+

```ts
import { headers } from 'next/headers'

export default async function Page() {
  const headerStore = await headers()
  const ua = headerStore.get('user-agent')
  const all = Object.fromEntries(headerStore.entries())
}
```

### `draftMode()` — async in Next.js 15+

```ts
import { draftMode } from 'next/headers'

export default async function Page() {
  const { isEnabled } = await draftMode()
  const data = await fetchData({ preview: isEnabled })
}
```

---

## Navigation Functions

### `redirect(url, type?)`

Redirects to a URL. Throws internally — place outside try/catch. Use in Server Components, Server Actions, and Route Handlers.

```ts
import { redirect } from 'next/navigation'

// Temporary redirect (307)
redirect('/login')

// Permanent redirect (308)
import { permanentRedirect } from 'next/navigation'
permanentRedirect('/new-path')
```

### `notFound()`

Triggers the nearest `not-found.tsx` (404).

```ts
import { notFound } from 'next/navigation'

const post = await db.post.findUnique({ where: { slug } })
if (!post) notFound()
```

### `forbidden()` — New in Next.js 15+

Triggers the nearest `forbidden.tsx` (403 Forbidden). Enable with `authInterrupts: true` in `next.config.ts`.

```ts
import { forbidden } from 'next/navigation'

export default async function AdminPage() {
  const session = await getSession()
  if (session?.role !== 'admin') forbidden()
  return <AdminDashboard />
}
```

### `unauthorized()` — New in Next.js 15+

Triggers the nearest `unauthorized.tsx` (401 Unauthorized).

```ts
import { unauthorized } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getSession()
  if (!session) unauthorized()
  return <ProtectedContent />
}
```

### `refresh()` — New

Refreshes the current route's Server Component data without a full page reload.

```ts
import { refresh } from 'next/navigation'

// In a Server Action
export async function syncData() {
  'use server'
  await db.sync()
  refresh()
}
```

---

## Cache Functions

### `revalidatePath(path, type?)`

Purges the cache for a specific path. Call in Server Actions or Route Handlers.

```ts
import { revalidatePath } from 'next/cache'

revalidatePath('/blog')          // revalidate this exact path
revalidatePath('/blog', 'page')  // revalidate all pages under /blog
revalidatePath('/blog', 'layout') // revalidate layout + all pages under it
```

### `revalidateTag(tag)`

Purges cache entries tagged with the given tag.

```ts
import { revalidateTag } from 'next/cache'

revalidateTag('posts')
revalidateTag(`user-${userId}`)
```

### `unstable_cache()` (Previous caching model)

Wraps an async function to memoize its result with optional TTL and tags.

```ts
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { tags: ['user'], revalidate: 3600 }
)
```

> **Prefer** `'use cache'` directive + `cacheTag()` / `cacheLife()` in the new model.

### `cacheTag(tag)` — New Cache Component model

Tags the current cache entry for targeted invalidation via `revalidateTag()`.

```ts
import { unstable_cacheTag as cacheTag } from 'next/cache'

async function getPost(slug: string) {
  'use cache'
  cacheTag(`post-${slug}`, 'posts')
  return db.post.findUnique({ where: { slug } })
}
```

### `cacheLife(profile)` — New Cache Component model

Sets the cache lifetime of the current `'use cache'` entry.

```ts
import { unstable_cacheLife as cacheLife } from 'next/cache'

async function getPosts() {
  'use cache'
  cacheLife('hours')  // built-in profile
  // or: cacheLife({ stale: 60, revalidate: 300, expire: 3600 })
  return db.post.findMany()
}
```

### `updateTag(tag)` — New

Updates/extends the TTL of cache entries with the given tag without invalidating.

```ts
import { updateTag } from 'next/cache'
updateTag('posts') // extends freshness
```

### `unstable_noStore()`

Opts a Server Component out of caching (makes it dynamic).

```ts
import { unstable_noStore } from 'next/cache'

export default async function LiveData() {
  unstable_noStore()
  const data = await fetch('https://api.example.com/live')
  return <div>{data}</div>
}
```

---

## `after()` — Post-Response Callbacks (Stable)

Schedule work to run **after** the response is sent. Imported from `next/server`.

```ts
import { after } from 'next/server'

export default async function Page() {
  after(() => {
    analytics.track('page_view')
  })
  return <Content />
}
```

---

### `connection()` — Force Dynamic (Stable)

Signals that the current component requires an active request connection (opt into dynamic rendering). Imported from `next/server`.

```ts
import { connection } from 'next/server'

export default async function Page() {
  await connection()
  return <p>{new Date().toISOString()}</p>
}
```

---

## Metadata Functions

### `generateMetadata`

```ts
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
    openGraph: { images: [post.image] },
  }
}
```

### `generateViewport`

Export from `page.tsx` or `layout.tsx` to control viewport settings separately from metadata.

```ts
export function generateViewport(): Viewport {
  return {
    themeColor: '#000',
    width: 'device-width',
    initialScale: 1,
  }
}
```

### `generateStaticParams`

Pre-generates dynamic routes at build time.

```ts
export async function generateStaticParams() {
  const posts = await db.post.findMany()
  return posts.map(p => ({ slug: p.slug }))
}
```

### `generateImageMetadata`

Generate multiple metadata images from a single route.

```ts
export function generateImageMetadata() {
  return [
    { id: 'small', contentType: 'image/png', size: { width: 200, height: 200 } },
    { id: 'large', contentType: 'image/png', size: { width: 600, height: 600 } },
  ]
}
export default function Icon({ id }: { id: string }) {
  return /* … */
}
```

### `generateSitemaps`

Split a sitemap into multiple pages (for large sites).

```ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }]
}
```

---

## Client Hooks

### `useRouter`

```ts
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/path')
router.replace('/path')
router.back()
router.forward()
router.refresh()
router.prefetch('/path')
```

### `usePathname`

```ts
'use client'
import { usePathname } from 'next/navigation'
const pathname = usePathname() // e.g., '/blog/hello'
```

### `useSearchParams`

Must be wrapped in `<Suspense>`. Returns read-only URLSearchParams.

```ts
'use client'
import { useSearchParams } from 'next/navigation'
const searchParams = useSearchParams()
const q = searchParams.get('q')
```

### `useParams`

```ts
'use client'
import { useParams } from 'next/navigation'
const params = useParams<{ slug: string }>()
```

### `useSelectedLayoutSegment` / `useSelectedLayoutSegments`

Read the active child segment from a layout.

```ts
'use client'
import { useSelectedLayoutSegment } from 'next/navigation'
const segment = useSelectedLayoutSegment() // e.g., 'blog'
```

### `useLinkStatus` — New

Tracks the loading state of the nearest `<Link>` ancestor during navigation.

```ts
'use client'
import { useLinkStatus } from 'next/link'

export function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return pending ? <Spinner /> : null
}
```

### `useReportWebVitals`

Report Core Web Vitals to an analytics endpoint.

```ts
'use client'
import { useReportWebVitals } from 'next/web-vitals'

useReportWebVitals((metric) => {
  console.log(metric.name, metric.value)
  // send to analytics
})
```

---

## Route Handler Utilities

### `NextRequest` / `NextResponse`

```ts
import { NextRequest, NextResponse } from 'next/server'

// proxy (formerly middleware)
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')
  return NextResponse.next({
    headers: { 'x-custom': 'value' },
  })
}
```

### `userAgent`

```ts
import { userAgent } from 'next/server'

export async function GET(request: NextRequest) {
  const { device, browser, isBot } = userAgent(request)
  return NextResponse.json({ device: device.type })
}
```

### `ImageResponse`

Generate OG images programmatically:

```ts
import { ImageResponse } from 'next/og'

export default function OGImage() {
  return new ImageResponse(<div style={{ fontSize: 48 }}>Hello OG!</div>, {
    width: 1200,
    height: 630,
  })
}
```

---

## Error Handling Functions

### `unstable_rethrow`

Re-throws internal Next.js errors (redirect, notFound) that were accidentally caught in a try/catch.

```ts
import { unstable_rethrow } from 'next/navigation'

try {
  const data = await riskyOperation()
} catch (e) {
  unstable_rethrow(e) // re-throw if it's a Next.js internal error
  // otherwise handle normally
  console.error(e)
}
```

### `unstable_catchError` — New

Utility to safely wrap async calls and get `[error, data]` tuples (similar to `try-catch` but cleaner).

```ts
import { unstable_catchError } from 'next/dist/server/app-render/work-unit-async-storage.external'
// API may change — check latest docs
```
