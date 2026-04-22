# Next.js Error Handling

## Error Handling Layers

| File | Catches | Notes |
|---|---|---|
| `error.tsx` | Errors in page + children | Must be `'use client'` |
| `global-error.tsx` | Errors in root layout | Must be `'use client'`, renders its own `<html>/<body>` |
| `not-found.tsx` | `notFound()` calls | Can be Server Component |
| `forbidden.js` | `forbidden()` calls | New in Next.js 15+, can be Server Component |
| `unauthorized.js` | `unauthorized()` calls | New in Next.js 15+, can be Server Component |

---

## `error.tsx` — Segment Error Boundary

```tsx
// app/dashboard/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Key points:**
- `error.tsx` does NOT catch errors in `layout.tsx` at the same level — wrap the layout in a parent `error.tsx`
- `reset()` re-renders the error boundary without a full page reload
- `error.digest` is a hash for server-side error log correlation

---

## `global-error.tsx` — Root Layout Error Boundary

Catches errors thrown by the root `app/layout.tsx`. Must include `<html>` and `<body>`.

```tsx
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h1>Critical Application Error</h1>
        <button onClick={reset}>Reload</button>
      </body>
    </html>
  )
}
```

---

## `not-found.tsx` — 404 UI

Triggered by calling `notFound()` anywhere in the render tree.

```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <Link href="/">Go Home</Link>
    </div>
  )
}
```

```tsx
// Triggering in a Server Component
import { notFound } from 'next/navigation'

const post = await db.post.findUnique({ where: { slug } })
if (!post) notFound()
```

---

## `forbidden.js` — 403 UI (New in Next.js 15+)

Create a `forbidden.js` file to render a custom 403 Forbidden page.

```tsx
// app/forbidden.js
export default function Forbidden() {
  return (
    <div>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
    </div>
  )
}
```

**Trigger:**
```ts
import { forbidden } from 'next/navigation'

export default async function AdminPanel() {
  const session = await getSession()
  if (!session?.isAdmin) forbidden()  // renders forbidden.js
  return <AdminDashboard />
}
```

**Enable** `authInterrupts` in `next.config.ts`:
```ts
const config: NextConfig = {
  experimental: { authInterrupts: true } // Required for forbidden.js / unauthorized.js
}
```

---

## `unauthorized.js` — 401 UI (New in Next.js 15+)

```tsx
// app/unauthorized.js
import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div>
      <h2>Please Sign In</h2>
      <Link href="/login">Login</Link>
    </div>
  )
}
```

**Trigger:**
```ts
import { unauthorized } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getSession()
  if (!session) unauthorized()  // renders unauthorized.js (401)
}
```

---

## Error Handling in Server Actions

Server Actions should return error state — do **not** rely on thrown errors for user-facing validation.

```ts
// app/actions.ts
'use server'

export async function createPost(prevState: unknown, formData: FormData) {
  const title = formData.get('title') as string

  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters' }
  }

  try {
    await db.post.create({ data: { title } })
    revalidatePath('/posts')
    return { success: true }
  } catch (e) {
    return { error: 'Failed to create post. Please try again.' }
  }
}
```

```tsx
'use client'

import { useActionState } from 'react'
import { createPost } from './actions'

export function PostForm() {
  const [state, action, isPending] = useActionState(createPost, null)

  return (
    <form action={action}>
      <input name="title" />
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p>Created!</p>}
      <button disabled={isPending}>Submit</button>
    </form>
  )
}
```

---

## `unstable_rethrow` — Re-throw Next.js Errors (Mandatory Pattern)

When wrapping code in `try/catch`, Next.js internal errors (like `redirect`, `notFound`, `forbidden`, `unauthorized`) get caught too, which prevents the framework from rendering the correct UI. **Always** use `unstable_rethrow` at the top of your `catch` block.

```ts
import { unstable_rethrow } from 'next/navigation'

try {
  const data = await riskyFetch()
} catch (e) {
  unstable_rethrow(e)   // ensures framework signals propagate
  
  // Handle other errors normally
  logger.error(e)
  return { error: 'Something went wrong' }
}
```

---

## `onRequestError` in `instrumentation.ts` (Stable in Next.js 15+)

Capture and report **all** server-side errors globally:

```ts
// instrumentation.ts
export async function onRequestError(
  err: unknown,
  request: {
    path: string
    method: string
    headers: Record<string, string>
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routeType: 'render' | 'route' | 'action' | 'middleware'
    routePath: string
    renderSource?: string
    revalidateReason?: string
  }
) {
  // Report to Sentry, Datadog, etc.
  await fetch('https://errors.example.com/report', {
    method: 'POST',
    body: JSON.stringify({ err, request, context }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function register() {
  // init observability SDK
}
```

---

## Error Boundary Nesting

```
app/
├── layout.tsx
├── global-error.tsx    ← catches errors in root layout
├── error.tsx           ← catches errors in root page
└── dashboard/
    ├── layout.tsx
    ├── error.tsx       ← catches errors in dashboard pages (NOT dashboard layout)
    └── page.tsx
```

**Important:** An `error.tsx` in a folder will NOT catch errors thrown by the `layout.tsx` in the **same** folder. The error boundary wraps the children of the layout, not the layout itself. Put the `error.tsx` one level up, or use `global-error.tsx`.

---

## Navigation Calls Must Be Outside try/catch

`redirect()`, `notFound()`, `forbidden()`, and `unauthorized()` throw internally.

```ts
// ❌ Wrong — redirect is swallowed
try {
  if (!authorized) redirect('/login')
} catch (e) {
  // redirect gets caught here accidentally
}

// ✅ Correct — redirect outside try/catch
if (!authorized) redirect('/login')

try {
  await riskyOperation()
} catch (e) {
  unstable_rethrow(e) // safe to have inside
  return { error: e.message }
}
```

---

## Client-Side Error Boundaries (React)

For client-only boundaries:

```tsx
'use client'

import { Component, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
```
