# Next.js Suspense Boundaries

## Why Suspense?

Suspense allows you to defer rendering of a component tree until a condition is met (like data fetching finishing). Next.js uses `<Suspense>` heavily for streaming HTML to the client to improve Time to First Byte (TTFB).

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      {/* Renders immediately */}
      <h1>Dashboard</h1>

      {/* Renders fallback, then swaps to content when fetch completes */}
      <Suspense fallback={<p>Loading revenue...</p>}>
        <RevenueChart />
      </Suspense>
    </div>
  )
}

// Async Server Component
async function RevenueChart() {
  const data = await fetchRevenue()
  return <Chart data={data} />
}
```

---

## `loading.tsx` Convention

The `loading.tsx` file inside an `app/` folder automatically wraps that segment's `page.tsx` (and its children) in a `<Suspense>` boundary.

```text
app/
├── dashboard/
│   ├── layout.tsx
│   ├── loading.tsx   <- The Suspense fallback
│   └── page.tsx      <- The suspended content
```

```tsx
// This is exactly what Next.js does under the hood:
<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>
```

---

## Suspense and `useSearchParams()`

If a Client Component uses `useSearchParams()`, it **must** be wrapped in a `<Suspense>` boundary. If you don't wrap it during static rendering, Next.js will de-opt the *entire route* to client-side rendering.

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SearchInput() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')

  return <input defaultValue={q || ''} />
}

export default function Page() {
  return (
    <div>
      <h1>Search</h1>
      {/* REQUIRED: Wrap the hook user in Suspense */}
      <Suspense fallback={<input placeholder="Loading..." disabled />}>
        <SearchInput />
      </Suspense>
    </div>
  )
}
```

> **Note**: This rule only applies to the *Client Component* hook `useSearchParams()`. Reading the async `searchParams` prop in a *Server Component* `page.tsx` does not require manual Suspense wrapping (but makes the page dynamically rendered).

---

## Granular Suspense vs Route-Level Suspense

Only wrap the specific slow components with Suspense, rather than the entire page.

```tsx
// ❌ Anti-pattern: Waiting for BOTH to finish before showing anything
export default async function Page() {
  const [fastData, slowData] = await Promise.all([getFast(), getSlow()])
  return <UI fast={fastData} slow={slowData} />
}

// ✅ Better: Streaming the slow part
export default function Page() {
  return (
    <>
      <Suspense fallback={<FastSkeleton />}>
        <FastComponent />
      </Suspense>

      <Suspense fallback={<SlowSkeleton />}>
        <SlowComponent />
      </Suspense>
    </>
  )
}
```

---

## Suspense and Streaming (Node.js vs Edge)

Streaming is fully supported on both the Node.js runtime and the Edge runtime in the App Router. There is no config needed to enable it — Suspense automatically streams the response.
