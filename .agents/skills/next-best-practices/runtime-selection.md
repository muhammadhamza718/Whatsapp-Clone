# Next.js Runtime Selection

## Node.js vs Edge Runtime

Next.js gives you the ability to select the runtime per route, or globally.

| Feature | Node.js Runtime (Default) | Edge Runtime |
|---|---|---|
| Startup Time | ~200ms | ~0ms |
| Supported APIs | Full Node.js API | Web APIs only (fetch, Request, Response) |
| NPM Packages | All | Most, but fails if relying on `fs`, `crypto`, etc. |
| Use cases | Database access (Prisma), file system | Fast API routes, A/B testing, middleware |

---

## Setting the Runtime Globally

```ts
// app/layout.tsx
// applies to the entire app if set at the root layout
export const runtime = 'edge'

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>
}
```

---

## Setting the Runtime per Route

```ts
// app/api/fast/route.ts
// applies only to this route handler
export const runtime = 'edge'

export async function GET() {
  return new Response('I am fast!')
}
```

```tsx
// app/dashboard/page.tsx
export const runtime = 'nodejs' // Explicit but usually unnecessary as it's the default

export default async function Page() {
  return <div>Dashboard</div>
}
```

---

## Incompatible Node.js APIs in Edge

If you use Edge, you CANNOT use:
- `fs` (File system)
- `child_process`
- `crypto` (Node's version — use `crypto.subtle` Web API instead)
- Prisma (without Prisma Accelerate/Data Proxy)
- `bcrypt` (use edge-compatible alternatives like `bcryptjs` if transpiled, or Web Crypto)

If you mistakenly import a Node API in Edge, the build will fail:
```bash
Module not found: Can't resolve 'fs'
```
