# Next.js Route Handlers

## Basics

Route Handlers live in `app/` and export HTTP verb functions. They replace `pages/api/` routes from the Pages Router.

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

**Supported methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

---

## Caching Behavior (Next.js 15 Breaking Change)

**GET handlers are NOT cached by default in Next.js 15+** (changed from Next.js 14).

```ts
// Next.js 15+ — GET is dynamic by default
export async function GET() {
  const time = new Date().toISOString()
  return NextResponse.json({ time }) // always fresh
}

// Opt into static caching
export const dynamic = 'force-static'

export async function GET() {
  const posts = await db.post.findMany() // cached at build time
  return NextResponse.json(posts)
}

// Opt into ISR (time-based revalidation)
export const revalidate = 60

export async function GET() {
  const posts = await db.post.findMany()
  return NextResponse.json(posts)
}
```

**Special metadata route handlers** (`sitemap.ts`, `opengraph-image.tsx`, `icon.tsx`) remain static by default.

---

## Dynamic Route Segments

```ts
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // async in Next.js 15+
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // async in v15/16
) {
  const { slug } = await params
  return Response.json({ slug })
}

// Note: Accessing params synchronously in a Route Handler will throw an error in Next.js 16+.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // async in v15, required in 16+
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  return NextResponse.json(post)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.post.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
```

---

## Reading Request Data

```ts
export async function POST(request: NextRequest) {
  // JSON body
  const body = await request.json()

  // Form data
  const formData = await request.formData()
  const name = formData.get('name')

  // Query params
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'

  // Headers
  const auth = request.headers.get('authorization')

  // Cookies
  const token = request.cookies.get('session')?.value
}
```

---

## Returning Responses

```ts
// JSON
return NextResponse.json({ ok: true })
return NextResponse.json({ error: 'Bad request' }, { status: 400 })

// Redirect
return NextResponse.redirect(new URL('/login', request.url))

// Rewrite (serve different content at same URL)
return NextResponse.rewrite(new URL('/internal', request.url))

// Plain text / HTML
return new Response('Hello world', {
  headers: { 'Content-Type': 'text/plain' },
})

// No content
return new Response(null, { status: 204 })

// Stream
const stream = new ReadableStream({ /* ... */ })
return new Response(stream)
```

---

## Setting Cookies in Route Handlers

```ts
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set('session', 'token-value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  return NextResponse.json({ ok: true })
}
```

---

## CORS Headers

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  const data = await getData()
  return NextResponse.json(data, { headers: corsHeaders })
}
```

---

## Streaming Responses

```ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of ['Hello', ' ', 'World']) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise(r => setTimeout(r, 100))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

**Server-Sent Events (SSE):**

```ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }
      send(JSON.stringify({ time: Date.now() }))
      // continue sending...
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

---

## Middleware vs Route Handlers

| | Middleware | Route Handler |
|---|---|---|
| Location | `middleware.ts` (root) | `app/*/route.ts` |
| Runs before | Every matched request | Only matched API calls |
| Can return UI | No | No (JSON/stream/redirect) |
| Can read body | No (stream) | Yes |
| Best for | Auth, redirects, headers | APIs, data mutations |

---

## Route Handler Limitations

- Cannot be co-located with `page.tsx` in the same folder — only one per segment
- Do not have access to the React tree (no JSX)
- In Next.js 15+, `params` is a Promise — always `await` it
- Not designed for high-volume WebSocket connections (use a separate server)

---

## Authentication Pattern

```ts
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  const data = await getUserData(user.id)
  return NextResponse.json(data)
}
```

---

## Webhook Handler Pattern

```ts
// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePayment(event.data.object)
      break
  }

  return new Response(null, { status: 200 })
}
```
