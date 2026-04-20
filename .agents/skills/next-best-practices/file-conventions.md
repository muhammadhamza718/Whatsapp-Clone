# Next.js File Conventions

## App Router File System

Every file in the `app/` directory has a special role. Files outside these conventions are co-located safely (they're not routes).

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Route UI (makes the segment a page)
├── loading.tsx         # Suspense boundary for the segment
├── error.tsx           # Error boundary (must be 'use client')
├── not-found.tsx       # 404 UI for notFound() calls
├── forbidden.js        # 403 UI for forbidden() calls (Next.js 15 Auth Interrupts)
├── unauthorized.js     # 401 UI for unauthorized() calls (Next.js 15 Auth Interrupts)
├── global-error.tsx    # Root-level error boundary (catches layout errors)
├── route.ts            # API Route Handler (no UI)
├── template.tsx        # Like layout but re-renders on navigation
├── default.tsx         # Fallback for parallel route slots
├── proxy.ts            # Middleware replacement in v16 (Next.js 16+)
├── instrumentation.ts  # Server lifecycle hooks (Stable)
├── instrumentation-client.ts # Client lifecycle hooks (Next.js 15.3+)
└── middleware.ts       # (in root, not app/) Request interception (Deprecated in v16)
```

---

## Core Special Files

### `layout.tsx` — Persistent Shell

Wraps children without re-rendering on navigation. Shared between siblings.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- **Root layout** (`app/layout.tsx`) must contain `<html>` and `<body>`
- Layouts are **Server Components** by default
- Cannot read `searchParams` — use `page.tsx` for that

### `page.tsx` — Route UI

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>         // async in Next.js 15+
  searchParams: Promise<{ q?: string }>     // async in Next.js 15+
}) {
  const { slug } = await params
  const { q } = await searchParams
  return <h1>{slug}</h1>
}
```

### `loading.tsx` — Streaming Skeleton

Automatically wraps the page in a `<Suspense>` boundary.

```tsx
export default function Loading() {
  return <div className="skeleton" />
}
```

### `error.tsx` — Error Boundary

Must be a **Client Component**. Receives `error` and `reset` props.

```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### `not-found.tsx` — 404 Page

Rendered when `notFound()` is called. Can be a Server Component.

```tsx
export default function NotFound() {
  return 202; // Note: Next.js renders this for notFound()
}
```

### `forbidden.js` / `unauthorized.js` (Next.js 15+)

Enable these UI conventions by setting `experimental.authInterrupts: true` in `next.config.ts`.

- **`forbidden.js`**: Rendered when `forbidden()` is called (403).
- **`unauthorized.js`**: Rendered when `unauthorized()` is called (401).

---

## `route.ts` — API Route Handler

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const posts = await db.post.findMany()
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}
```

> **Next.js 15+**: GET handlers are **no longer cached by default**. To opt into caching:
> `export const dynamic = 'force-static'`

---

## `template.tsx` — Re-rendering Wrapper

Like `layout` but creates a new instance on every navigation (mounts/unmounts). Useful for animations or `useEffect` that must run on each route change.

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

---

## `default.tsx` — Parallel Route Fallback

Rendered when a parallel route slot has no matching segment.

---

## `instrumentation.ts` — Server Lifecycle (Stable)

Runs once when the Next.js server starts. Used for observability, error tracking.

```ts
// instrumentation.ts (root of project, same level as app/)
import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({ serviceName: 'my-app' })
}

// New in Next.js 15: capture all server errors
export async function onRequestError(
  err: unknown,
  request: { method: string; url: string },
  context: { routerKind: string; routeType: string }
) {
  // custom error reporting logic
}
```

---

## `instrumentation-client.ts` — Client Lifecycle (Next.js 15.3+)

Similar to `instrumentation.ts` but runs on the **client side** before any other application code. Ideal for initializing client-side analytics or monitoring.

---

## Metadata Files

Place in `app/` or any route segment. Statically typed names are automatically recognized:

| File | Purpose |
|---|---|
| `favicon.ico` | Browser tab icon |
| `icon.png` / `icon.svg` | App icon |
| `apple-icon.png` | Apple touch icon |
| `opengraph-image.png` / `opengraph-image.tsx` | OG image |
| `twitter-image.png` / `twitter-image.tsx` | Twitter card image |
| `sitemap.xml` / `sitemap.ts` | Sitemap |
| `robots.txt` / `robots.ts` | Robots file |
| `manifest.json` / `manifest.ts` | Web app manifest |

---

## Route Segment Config Exports

Export these constants from `layout.tsx`, `page.tsx`, or `route.ts`:

```ts
// Control rendering behavior
export const dynamic = 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const dynamicParams = true | false  // false = 404 for non-generated params
export const revalidate = false | 0 | number  // ISR interval in seconds
export const fetchCache = 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'
export const runtime = 'nodejs' | 'edge'
export const preferredRegion = 'auto' | 'global' | 'home' | string | string[]
export const maxDuration = number  // max execution time in seconds
```

---

## Dynamic Routes

```
app/blog/[slug]/page.tsx            → /blog/:slug
app/shop/[...categories]/page.tsx   → /shop/a/b/c (catch-all)
app/shop/[[...categories]]/page.tsx → /shop and /shop/a/b/c (optional catch-all)
app/(marketing)/about/page.tsx      → /about (route group, no URL segment)
app/@modal/(.)photo/[id]/page.tsx   → intercepting route
app/_components/Button.tsx          → co-located private folder (not a route)
```

## `proxy.ts` (Next.js 16+) / `middleware.ts` (Next.js 15)

The file previously known as `middleware.ts` has been renamed to **`proxy.ts`** in Next.js 16 to better represent its role as a network boundary. `middleware.ts` is deprecated in v16.

### Migration from `middleware.ts` to `proxy.ts`:

1.  **Rename the file**: `middleware.ts` ➜ `proxy.ts`
2.  **Rename the function**: `export function middleware` ➜ `export function proxy`

```ts
// proxy.ts (Root of project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (!request.cookies.get('token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

> **Note:** In Next.js 15 and below, continue using `middleware.ts`. Enable `experimental.authInterrupts: true` for `forbidden.js` / `unauthorized.js` support.

---

## `next.config.ts` (New — TypeScript config)

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // type-safe config with autocomplete
}

export default config
```
