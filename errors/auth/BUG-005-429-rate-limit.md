# BUG-005 — 429 Too Many Requests on Vercel Auth

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | BUG-005 |
| **Category** | auth |
| **Status** | fix-attempted |
| **Reported** | 2026-05-02 |
| **Resolved** | — |
| **Severity** | 🟠 Medium (blocks testing, but intentional security feature) |

---

## Symptom

- `POST /api/auth/sign-in/social` returns `429 Too Many Requests`.
- The user is unable to proceed with the Google login flow.

---

## Root Cause

Better Auth has a built-in rate limiter that defaults to a strict window for authentication routes. Multiple failed attempts and retries during the debugging of the database schema and environment variables caused the user's IP to be throttled.

---

## Fix Attempts

### Attempt #1 — 2026-05-02

**Changes made:**
1. **Code fix** in `frontend/lib/auth.ts` — Disabled rate limiting:
   ```ts
   rateLimit: {
     enabled: false,
   },
   ```

**Status:** `fix-attempted` — awaiting redeploy and user confirmation.

---

## Resolution

_Awaiting verification._

---

## Interview Notes

**Root Cause:** Rate limiting is a security feature to prevent brute force. However, during development and intensive debugging, it can block the developer. The fix is to temporarily disable it until the core flow is verified.

**Key Lesson:** Always check for default rate limits when a "new" error appears during rapid testing cycles.
