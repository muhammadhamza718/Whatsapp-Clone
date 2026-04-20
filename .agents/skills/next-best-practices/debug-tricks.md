# Debugging Tricks in Next.js

## 1. Inspecting the Cache

If stale data is showing, you need to know *what* is cached and *why*.

- **Hard Reload (Shift+F5):** Does NOT clear the Next.js Server Cache. It only skips the Client Router Cache (the frontend memory cache).
- **Clear Server Cache:** The only way to manually clear the server cache locally is to delete the `.next` folder and run `npm run dev` again, or trigger a Server Action with `revalidatePath()`.

Create a hidden debug route constraint to manually bust cache during dev:

```ts
// app/api/debug/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }

  if (path) revalidatePath(path)
  if (tag) revalidateTag(tag)

  return NextResponse.json({ revalidated: true, path, tag })
}
```

Usage: `http://localhost:3000/api/debug/revalidate?path=/blog`

---

## 2. Server vs Client Console Logs

- `console.log()` in a **Server Component** (`async function Page()`) prints to your Terminal (where you ran `npm run dev`).
- `console.log()` in a **Client Component** (`'use client'`) prints to the Browser DevTools console.

**Warning:** Client Components are *pre-rendered* on the server. So a `console.log` in a Client Component may print in **both** the Terminal (during SSR) and the Browser (during hydration).

---

## 3. Finding Hydration Errors

React hydration errors happen when the server HTML doesn't match the initial client render (often caused by `typeof window !== 'undefined'` checks outside effects).

React 19 / Next.js 15 provide dramatically improved hydration error messages that show the exact element and file diff.

If you still need to find the culprit:
1. Look at the React Error overlay — it will point to the exact file and line.
2. Check for `<table>` missing `<tbody>`, or `<p>` containing a `<div>` (HTML semantic errors cause React hydration to fail).
3. If using `Date.now()` or Math.random(), ensure they only run inside a `useEffect`.

---

## 4. Why is my Page Dynamic?

Next.js will silently opt your page into Dynamic Rendering if you use dynamic functions.

To force a page to be static and make Next.js throw a build error if it can't be:

```ts
// app/page.tsx
export const dynamic = 'force-static'

export default async function Page() {
  // If you call cookies() or headers() here, the build will now FAIL
  // instead of silently becoming dynamic.
}
```

---

## 5. Enable Logging Config

Turn on verbose fetch logging in `next.config.ts` to see exactly what API requests Next.js is making on the server, and whether they hit/miss the cache.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
export default config
```

Terminal output:
```bash
GET /api/data 200 OK - 24ms
  Cache: HIT
GET /api/other 200 OK - 150ms
  Cache: MISS
```

---

## 6. Turbopack Debugging

If Turbopack (`next dev --turbo`) is throwing errors or acting strangely:

1. Look for unsupported webpack plugins (many don't work in Turbopack yet).
2. Delete the `.next` folder and restart.
3. Fallback to `next dev` without the `--turbo` flag to verify if it's a Turbopack-specific bug.

---

## 7. Model Context Protocol (MCP)

If you are using Cursor, Claude, or other LLMs, you can point them to Next.js's documentation by passing the docs MCP server (or fetching the docs manually if not configured).

---

## 9. Next.js 16 Engine Requirements

Next.js 16 dropped support for Node.js 18.x.
- **Minimum Node.js**: 20.9.0+
- **Recommended Node.js**: Latest LTS

If you see cryptic `Unexpected token` errors in `node_modules`, check your `node -v`.

---

## 10. Turbopack Debugging (Next.js 16)

Since Turbopack is the default in 16, debugging build issues changes:
1. **Persistent Cache**: Clear the `.next` folder if you suspect stale build artifacts.
2. **Missing Features**: If a specific webpack plugin is missing, use the `next.config.ts` `turbopack` fields to add custom rules/aliases.
3. **Opting Out**: If necessary, you can temporarily opt-out to webpack using `--no-turbo` (though this is deprecated).
