---
name: endpoint-best-practices
description: "Expert skill for building, auditing, and debugging API endpoints in Full-Stack Next.js App Router + external API projects. ALWAYS use when user: asks to build or scaffold an endpoint/route handler; has fetch/API calls failing, returning undefined, or throwing errors; reports CORS, 500, 401, or 404 errors from route logic; says frontend can't talk to backend or external API; wants to audit or improve existing endpoints; mentions inconsistent response shapes, missing error handling, weak connections, or broken routes after a code change. Runs a 3-phase loop: BUILD (canonical blueprint) → AUDIT (scored checklist /100) → DEBUG (break recovery with root cause diagnosis). Use even if the user mentions only one phase."
---

# Endpoint Best Practices

A full-stack skill for building strong, consistent, debuggable API endpoints in Next.js App Router projects that integrate with external APIs.

## When You Enter This Skill

Identify which phase the user needs:

| Signal | Phase to Run |
|---|---|
| "build me an endpoint", "create a route" | Phase 1 → Blueprint |
| "audit my endpoints", "are my routes good?" | Phase 2 → Audit |
| Error trace, fetch failing, routes not connecting | Phase 3 → Debug |
| New project / greenfield setup | Phase 1 → then offer Phase 2 |
| Post-fix verification | Phase 2 → re-score |

You may run multiple phases in one response. Always end with a re-audit score after any fix.

---

## PHASE 1 — Blueprint (Build It Right)

### Step 1: Fetch Latest Docs (Required)

Before generating any code, use Context7 to pull the latest Next.js App Router documentation on Route Handlers. Never rely on training data alone for framework APIs.

```
Use Context7 to resolve: "nextjs route handlers app router"
Then fetch: request/response API, error handling patterns, middleware
```

If Context7 is unavailable, use web_search: `Next.js App Router Route Handler best practices {current year}`

---

### Step 2: Generate the 5 Core Building Blocks

Output all 5 blocks in order. Adapt to the user's type-safety layer:
- **TypeScript only** → use native types
- **TypeScript + Zod** → add Zod schema slots
- **TypeScript + Zod + tRPC** → note tRPC replaces route handlers; provide the procedure equivalent

---

#### Block 1 — Standard Response Wrapper

Every endpoint must return this shape. No exceptions.

```typescript
// lib/api/response.ts

export type ApiResponse<T = null> = {
  success: boolean
  data: T | null
  error: string | null
  status: number
}

export function apiSuccess<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data, error: null, status }
  return Response.json(body, { status })
}

export function apiError(message: string, status = 500): Response {
  const body: ApiResponse = { success: false, data: null, error: message, status }
  return Response.json(body, { status })
}
```

**Rule:** Never return raw data directly. Never return `{ message: "ok" }`. Always use `apiSuccess` / `apiError`.

---

#### Block 2 — Centralized Error Class

```typescript
// lib/api/errors.ts

export class AppError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = "AppError"
    this.status = status
  }
}

// Common error factories
export const Errors = {
  notFound: (resource: string) => new AppError(`${resource} not found`, 404),
  unauthorized: () => new AppError("Unauthorized", 401),
  forbidden: () => new AppError("Forbidden", 403),
  badRequest: (msg: string) => new AppError(msg, 400),
  conflict: (msg: string) => new AppError(msg, 409),
}
```

**Rule:** Never `throw new Error("something")` in a route. Always throw `AppError` so the status code travels with the error.

---

#### Block 3 — Route Handler Template

```typescript
// app/api/[resource]/route.ts

import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api/response"
import { AppError } from "@/lib/api/errors"
// import { z } from "zod"          // Uncomment for Zod validation
// import { withAuth } from "@/lib/api/middleware"  // Uncomment for auth

// Optional: Zod schema
// const BodySchema = z.object({ name: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (always first)
    // const session = await getServerSession()
    // if (!session) throw Errors.unauthorized()

    // 2. Parse + validate body
    const body = await req.json()
    // const parsed = BodySchema.safeParse(body)
    // if (!parsed.success) throw Errors.badRequest(parsed.error.message)

    // 3. Business logic here
    const result = await yourService(body)

    // 4. Always return via wrapper
    return apiSuccess(result, 201)

  } catch (err) {
    if (err instanceof AppError) {
      return apiError(err.message, err.status)
    }
    console.error("[POST /api/resource]", err)
    return apiError("Internal server error", 500)
  }
}
```

**Rules:**
- Auth check runs **before** everything else
- Validation runs **before** business logic
- Every catch block checks for `AppError` first
- Log unexpected errors with the route path prefix

---

#### Block 4 — External API Bridge (`apiFetch`)

Wraps every outbound call with timeout, auth headers, and normalized error handling.

```typescript
// lib/api/fetch.ts

type FetchOptions = RequestInit & {
  timeout?: number
  authToken?: string
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 8000, authToken, ...init } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...init.headers,
      },
    })

    clearTimeout(timer)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new AppError(
        errBody?.message ?? `External API error: ${res.status}`,
        res.status
      )
    }

    return res.json() as Promise<T>

  } catch (err) {
    clearTimeout(timer)
    if (err instanceof AppError) throw err
    if ((err as Error).name === "AbortError") {
      throw new AppError("External API request timed out", 504)
    }
    throw new AppError("Failed to reach external API", 502)
  }
}
```

**Rules:**
- Always set a timeout (default 8s)
- Never call `fetch()` directly in a route handler — always go through `apiFetch`
- Normalize all external errors into `AppError` before they reach the route

---

#### Block 5 — Middleware (Reusable Guards)

```typescript
// lib/api/middleware.ts

import { NextRequest } from "next/server"
import { AppError, Errors } from "./errors"

type RouteHandler = (req: NextRequest, ctx?: unknown) => Promise<Response>

// Auth guard — wraps any route handler
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    // Replace with your auth provider check
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      const err = Errors.unauthorized()
      return Response.json({ success: false, error: err.message }, { status: err.status })
    }
    return handler(req, ctx)
  }
}

// Usage in route.ts:
// export const POST = withAuth(async (req) => { ... })
```

---

## PHASE 2 — Audit (Score Existing Endpoints)

When a user pastes an endpoint, score it across 6 categories. Output the score table, violations list, and fixed version.

### Scoring Rubric

| # | Category | What to Check | Points |
|---|---|---|---|
| 1 | **Response Shape** | Returns `{ success, data, error, status }` consistently | /20 |
| 2 | **Error Handling** | try/catch present, `AppError` used, no raw `throw new Error()` | /20 |
| 3 | **Input Validation** | Body/params validated before business logic (Zod or equivalent) | /15 |
| 4 | **Auth Guard** | Auth checked as the first step, before any data access | /15 |
| 5 | **External API Bridge** | Outbound calls use `apiFetch` with timeout + error normalization | /15 |
| 6 | **HTTP Status Codes** | Correct codes used: 200, 201, 400, 401, 403, 404, 409, 500, 502, 504 | /15 |

### Score Badges

| Score | Badge |
|---|---|
| 90–100 | ✅ Production Ready |
| 70–89 | 🟡 Needs Minor Fixes |
| 50–69 | 🟠 Needs Work |
| 0–49 | 🔴 Rebuild Required |

### Audit Output Format

```
AUDIT SCORE: XX/100 — [Badge]

VIOLATIONS:
- [Category] — [Exact issue on line N] — [One-line reason]
- ...

FIXED ENDPOINT:
[Full corrected code]

RE-AUDIT: XX/100 — [Badge]
```

**Rule:** Always output the re-audit score after the fix. The score must improve. If it doesn't, explain why.

---

## PHASE 3 — Debug Loop (Break Recovery)

When the user reports an error **after implementing the blueprint**, or when any route/fetch error appears, enter Debug Mode.

### Step 1: Map the Error to a Block

| Error Pattern | Likely Block | Likely Cause |
|---|---|---|
| Type error on `data`, `success`, `error` fields | Block 1 — Response Wrapper | Shape mismatch, wrong import |
| `ZodError`, `unexpected token`, validation crash | Block 3 — Route Template | Schema mismatch or missing `.safeParse` |
| `undefined`, `null` from external API call | Block 4 — apiFetch | Missing await, wrong URL, no error boundary |
| `AbortError`, fetch timeout, `ERR_NETWORK` | Block 4 — apiFetch | Timeout too short or server unreachable |
| `401 Unauthorized` on valid requests | Block 5 — Middleware | Token not forwarded, header key mismatch |
| CORS error | Block 3 — Route Template | Missing CORS headers or wrong HTTP method |
| `500` with no error message logged | Block 2 — Error Class | Raw `throw new Error()` bypassing `AppError` |
| `Cannot read properties of undefined` | Block 3 or 4 | Unguarded async response, missing null check |

### Step 2: Output Debug Response

```
ROOT CAUSE: [One sentence — exact block, exact reason]

BROKEN CODE:
[The specific lines causing the issue]

FIXED CODE:
[Exact fix with explanation inline as comments]

PREVENTION: [One rule to prevent this class of error going forward]
```

**Rules:**
- Never say "check your code" or "try this maybe"
- Always name the exact block, exact line, exact reason
- Always output the specific fix — not a general suggestion
- After fixing, run Phase 2 audit on the corrected endpoint

### Step 3: Post-Fix Verification

After every debug fix:
1. Trace the request path from client → route handler → external API (if applicable) → response
2. Confirm the response wrapper is intact end-to-end
3. Re-score the endpoint with the Phase 2 rubric
4. If the score dropped anywhere, flag it

---

## Key Rules (Always Apply)

1. **Never skip the response wrapper.** Raw returns break clients silently.
2. **Auth before everything.** If auth runs after a DB call, that's a security hole.
3. **Never call `fetch()` directly** in a route. Always use `apiFetch`.
4. **AppError carries the status code.** Never throw a generic Error in route logic.
5. **Log with route prefix.** `console.error("[POST /api/users]", err)` — makes debugging instant.
6. **Validate before you touch the DB.** Zod errors are cheap. DB rollbacks are not.
7. **Always re-audit after a fix.** The score must go up, not sideways.

---

## Reference: HTTP Status Code Guide

| Code | Use When |
|---|---|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 400 | Bad request / invalid input |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already exists) |
| 500 | Unhandled server error |
| 502 | External API returned an error |
| 504 | External API timed out |

---

## Compatibility

- **Framework:** Next.js App Router (v13+), compatible with Pages Router with minor adaptation
- **Language:** TypeScript (required for type safety)
- **Validation:** Zod (recommended), native TS types (minimum), tRPC procedures (alternative)
- **Auth:** Framework-agnostic — works with NextAuth, Clerk, Supabase Auth, custom JWT
- **External APIs:** Any REST API via `apiFetch` wrapper
- **Docs source:** Context7 (primary), web_search fallback for latest Next.js Route Handler API
