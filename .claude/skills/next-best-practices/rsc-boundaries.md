# Next.js Server Components and Boundaries

## React Server Components (RSC) Default

By default, all components in `app/` are Server Components.

**Server Components CAN:**
- Run exclusively on the server (no JS shipped to the client)
- Access backend resources directly (databases, filesystems)
- Read sensitive environment variables (`process.env.DB_PASS`)
- Be `async` and use `await` natively
- Import Client Components

**Server Components CANNOT:**
- Use React hooks (`useState`, `useEffect`, `useContext`)
- Listen to browser events (`onClick`, `onChange`)
- Access browser APIs (`window`, `localStorage`)

```tsx
// This runs only on the server
import db from '@/lib/db'
import { ClientButton } from './ClientButton' // Can import client components

export default async function Page() {
  const data = await db.query() // Direct DB access

  return (
    <div>
      <h1>Server rendered: {data.title}</h1>
      <ClientButton dataId={data.id} />
    </div>
  )
}
```

---

## Client Components

Use `'use client'` at the very top of a file to opt into Client Components. This creates a boundary: the component and everything it imports will be included in the client JS bundle.

**Client Components CAN:**
- Use React hooks
- Attach event listeners
- Access browser APIs
- Still be **pre-rendered** on the server during initial page load! (Don't confuse Client Components with "Client-Side Only Rendering".)

```tsx
'use client'

import { useState } from 'react'
import { submitLike } from './actions'

export function ClientButton({ dataId }: { dataId: string }) {
  const [likes, setLikes] = useState(0)

  return (
    <button onClick={() => {
      setLikes(l => l + 1)
      submitLike(dataId) // Call Server Action
    }}>
      Like {likes}
    </button>
  )
}
```

---

## The Boundary Rule (Crucial)

**You CANNOT import a Server Component into a Client Component.**

If you do, the Server Component silently becomes a Client Component (because the Client Component's bundle swallows its imports). This can accidentally expose secrets to the browser and inflate bundle size!

### How to nest Server Components inside Client Components:

Pass the Server Component as a `children` prop.

```tsx
// ❌ WRONG
'use client'
import ServerWidget from './ServerWidget' // Becomes client code!

export default function ClientWrapper() {
  return <div><ServerWidget /></div>
}
```

```tsx
// ✅ CORRECT (Composition)
// ClientWrapper.tsx
'use client'
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Can use state/effects here
  return <div>{children}</div>
}

// page.tsx (Server Component)
import ClientWrapper from './ClientWrapper'
import ServerWidget from './ServerWidget'

export default function Page() {
  return (
    <ClientWrapper>
      {/* Server component remains on the server, passed as a React node */}
      <ServerWidget />
    </ClientWrapper>
  )
}
```

---

## Serialization Requirements

When passing props from a Server Component to a Client Component, the props must be **serializable** (able to be converted to JSON).

**Allowed across boundary:**
- strings, numbers, booleans, null, undefined
- arrays, plain objects
- Promises (can be passed and resolved on client with `use()` hook)
- Server environment functions (`'use server'`)

**NOT allowed across boundary:**
- Classes (`Date`, `BigInt`, custom classes)
- Generic functions (event handlers)
- React Nodes (except strictly passed as `children`)

### Passing Dates / Classes

If an ORM returns a `Date` object or a class instance from a Server Component, you must serialize it before passing it to a Client Component.

```tsx
// Server Component
const user = await db.user.find(1) // user.createdAt is a Date object

// ❌ Throws serialization error
// <ClientProfile user={user} />

// ✅ Correct
const serializableUser = {
  ...user,
  createdAt: user.createdAt.toISOString() // convert to string
}
<ClientProfile user={serializableUser} />
```

---

## Keeping Client Components Leaves

A common best practice is to move Client Components to the "leaves" of your component tree.

If you have a whole page layout, don't put `'use client'` at the top just because you need one interactive button. Extract the button into a separate Client Component so the rest of the layout remains a Server Component.

---

## Supported Context (Third-Party Providers)

If you use a third-party library that relies on `useContext` (like Redux, styled-components, or theme providers), you must wrap it in a Client Component boundary before using it in the Root Layout.

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'acme-theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```
