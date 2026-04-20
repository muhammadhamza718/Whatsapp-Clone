# Next.js Parallel & Intercepting Routes

Advanced routing patterns that allow multiple pages to render in the same layout simultaneously, or intercept a route to show it as a modal.

---

## Parallel Routes

Defined using named "slots" starting with `@`. Slots are passed as props to the shared `layout.tsx`.

```text
app/
├── @analytics/
│   └── page.tsx      // Default page for analytics slot
├── @team/
│   └── page.tsx      // Default page for team slot
├── layout.tsx        // Receives slots as props
└── page.tsx          // Main children
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <div>
      <main>{children}</main>
      <aside>{team}</aside>
      <aside>{analytics}</aside>
    </div>
  )
}
```

### Unmatched Routes & `default.tsx`

When navigating *client-side*, Next.js keeps unmatched slots active.
But on *hard reload* (SSR), Next.js cannot figure out what to render for slots that don't match the current URL.

If a slot does not have a route matching the URL, you **must** provide a `default.tsx`.

```text
app/
├── @team/
│   ├── settings/page.tsx
│   └── default.tsx       // Fallback on hard reload to /settings
```

```tsx
// app/@team/default.tsx
export default function Default() {
  return null // Render nothing, or a fallback UI
}
```

### Active State & Navigation

Each parallel route acts exactly like an independent application. It can have its own `loading.tsx`, `error.tsx`, and `layout.tsx`. Navigating one slot doesn't trigger a recreation of the entire page or other slots.

---

## Intercepting Routes

Intercepting routes allow you to load a route from another part of your application within the current layout (commonly used for **modals** or **photo galleries**).

Defined using "relative path" conventions similar to standard directories:
- `(.)` matches segments on the same level
- `(..)` matches segments one level above
- `(..)(..)` matches segments two levels above
- `(...)` matches segments from the root `app` directory

### Common Pattern: Photo Modal

Goal: Clicking a photo opens it in a modal. Refreshing the page, or copying the URL, shows the full standalone photo page.

```text
app/
├── feed/
│   ├── @modal/
│   │   ├── (.)photo/
│   │   │   └── [id]/page.tsx   // The INTERCEPTED modal view
│   │   └── default.tsx         // Return null when modal is closed
│   ├── photo/
│   │   └── [id]/page.tsx       // The FULL standalone page
│   ├── layout.tsx              // Receives @modal prop
│   └── page.tsx                // The feed containing links
```

1. **The Links:**
```tsx
// app/feed/page.tsx
import Link from 'next/link'

export default function Feed({ photos }) {
  return photos.map(p => (
    // Clicking this triggers the interception within the Feed layout
    <Link key={p.id} href={`/feed/photo/${p.id}`}>
      <Thumbnail url={p.url} />
    </Link>
  ))
}
```

2. **The Layout:**
```tsx
// app/feed/layout.tsx
export default function FeedLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal} {/* Renders the intercepted route here */}
    </>
  )
}
```

3. **The Intercepted Modal:**
```tsx
// app/feed/@modal/(.)photo/[id]/page.tsx
import { Modal } from '@/components/Modal'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }> // async in v15, required in 16+
}) {
  const { id } = await params
  const photo = await getPhoto(id)
  // Renders over the feed
  return <Modal><img src={photo.url} /></Modal>
}
```

4. **Closing the Modal (Crucial):**

To close an intercepted modal, you must navigate back, or call `router.back()`.

```tsx
'use client'
import { useRouter } from 'next/navigation'

export function Modal({ children }) {
  const router = useRouter()
  return (
    <div className="backdrop" onClick={() => router.back()}>
      {children}
    </div>
  )
}
```

If you need a "close" button that redirects without relying on browser history:

```tsx
'use client'
import { useRouter } from 'next/navigation'

export function CloseButton() {
  const router = useRouter()
  return (
    <button onClick={() => {
      // Pushing to the base path will unmount the modal slot
      // and mount the @modal/default.tsx (which should return null)
      router.push('/feed')
    }}>
      Close
    </button>
  )
}
```

---

## Combining Parallel and Intercepting Routes

Almost every use of intercepting routes requires a parallel route to hold the intercepted UI (so the background layout stays visible). Always remember to provide a `default.tsx` that returns `null` for the slot so nothing renders when the interception isn't active.
