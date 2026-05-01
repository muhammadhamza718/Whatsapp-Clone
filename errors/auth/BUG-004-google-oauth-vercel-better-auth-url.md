# BUG-004 — Google OAuth Fails on Vercel (BETTER_AUTH_URL = localhost)

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | BUG-004 |
| **Category** | auth |
| **Status** | resolved |
| **Reported** | 2026-05-01 |
| **Resolved** | 2026-05-02 |
| **Severity** | 🔴 Critical (social auth completely broken in production) |

---

## Symptom

- Clicking "Continue with Google" on the Vercel-deployed app (`whatsapp-clone-relay.vercel.app`) does not complete sign-in.
- POST to `/api/auth/sign-in/social` fires but Google OAuth flow fails or redirects incorrectly.
- Works perfectly on `localhost:3000`.

### Vercel Logs
```
May 01 01:38:25.26 POST — whatsapp-clone-relay.vercel.app /api/auth/sign-in/social
(node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca'
are treated as aliases for 'verify-full'...
```

---

## Root Cause

**Three causes identified (in order of impact):**

### Cause #1 — `BETTER_AUTH_URL` set to `localhost` (PRIMARY)
- **File:** `frontend/.env` line 2
- **Value:** `BETTER_AUTH_URL=http://localhost:3000`
- Better Auth uses this value to construct the **OAuth callback URI** it sends to Google.
- On Vercel, this means the OAuth redirect target is `http://localhost:3000/api/auth/callback/google`, which Google rejects or never resolves back to the production deployment.

### Cause #2 — Google Cloud Console missing Vercel redirect URI
- The Vercel URL `https://whatsapp-clone-relay.vercel.app/api/auth/callback/google` is not registered in the OAuth app's **Authorized redirect URIs** in Google Cloud Console.

### Cause #3 — pg SSL deprecation warning (cosmetic)
- **File:** `frontend/lib/auth.ts` line 6
- `{ rejectUnauthorized: false }` without explicit `sslmode` triggers pg's deprecation warning.
- Not causing the auth failure, but will break in pg v9.

---

## Fix Attempts

### Attempt #1 — 2026-05-01

**Changes made:**

1. **Vercel Dashboard** → Project Settings → Environment Variables → Set:
   ```
   BETTER_AUTH_URL=https://whatsapp-clone-relay.vercel.app
   ```

2. **Google Cloud Console** → APIs & Services → Credentials → OAuth Client → Added:
   - Authorized redirect URI: `https://whatsapp-clone-relay.vercel.app/api/auth/callback/google`
   - Authorized JavaScript origin: `https://whatsapp-clone-relay.vercel.app`

3. **Code fix** in `frontend/lib/auth.ts` — explicit ssl config to silence pg warning:
   ```ts
   ssl: process.env.NODE_ENV === "production"
     ? { rejectUnauthorized: false, sslmode: "verify-full" } as Record<string, unknown>
     : false,
   ```

**Status:** `fix-attempted` — awaiting user confirmation.

---

## Resolution

The issue was resolved by a multi-step process:
1. **Environment Config:** Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` on Vercel to match the production domain.
2. **Google Cloud Console:** Moved the app to "Production" status and registered the correct Redirect URIs.
3. **Database Schema:** (CRITICAL) Manually added the missing tables (`account`, `session`, `verification`) and columns (`emailVerified`, `createdAt`, `updatedAt`) to the Neon PostgreSQL database, which were missing from the initial backend migrations.
4. **Code Hardening:** Updated `auth.ts` to include `trustedOrigins` and robust `baseURL` detection.

---

## Interview Notes

**Root Cause:** Better Auth constructs Google OAuth redirect URIs from `BETTER_AUTH_URL`. Since this env var pointed to `localhost`, all production OAuth callbacks were sent to a dead address. The fix is a two-part operation: update the env var on Vercel AND register the Vercel URL in Google Cloud Console.

**Key Lesson:** OAuth social providers require an exact match between where the auth library thinks it lives (`BETTER_AUTH_URL`) and what's registered in the provider's console (Google Cloud). `.env` files are local-only; production env vars must be set in the hosting platform dashboard.
