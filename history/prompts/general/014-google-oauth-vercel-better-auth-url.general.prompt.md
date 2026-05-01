---
id: "014"
title: Google OAuth Fails on Vercel BETTER_AUTH_URL
stage: general
date: 2026-05-01
surface: agent
model: Claude Sonnet 4.6 (Thinking)
feature: auth
branch: main
user: muhammadhamza718
command: "debug google oauth vercel"
labels: ["auth", "better-auth", "google-oauth", "vercel", "deployment", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/auth.ts (modified — ssl config)
  - errors/auth/BUG-004-google-oauth-vercel-better-auth-url.md (created)
tests:
  - manual: confirm google oauth works after BETTER_AUTH_URL set in Vercel dashboard
---

## Prompt

May 01 01:38:25.26
POST
---
whatsapp-clone-relay.vercel.app
/api/auth/sign-in/social
(node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'. In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees. To prepare for this change: - If you want the current behavior, explicitly use 'sslmode=verify-full' - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require' See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.

Can you tell me why i can continue with google in vercel deployed project?
it is working properly in locally

2026-04-30 20:38:25.558 [error] (node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.

@[/endpoint-best-practices]
@[/systematic-debugging]

Is the error is in the code or do i setup wrong something in vercel?

## Response snapshot

Root cause identified via systematic debugging (Phase 1). Three causes found:

1. PRIMARY: `BETTER_AUTH_URL=http://localhost:3000` in `.env` — Better Auth sends this as the OAuth callback URI to Google, which fails in production.
2. Google Cloud Console missing Vercel URL in Authorized Redirect URIs.
3. pg SSL deprecation warning (cosmetic, not causing auth failure).

Fixes:
- Set `BETTER_AUTH_URL=https://whatsapp-clone-relay.vercel.app` in Vercel dashboard env vars.
- Add Vercel URL to Google Cloud Console OAuth app.
- Code fix in auth.ts for explicit SSL config.

## Outcome

- ✅ Impact: Google OAuth should work on Vercel after env var and Google Console changes
- 🧪 Tests: Manual — click "Continue with Google" on deployed app after fix
- 📁 Files: frontend/lib/auth.ts modified; BUG-004 created
- 🔁 Next prompts: Confirm OAuth works; consider github oauth setup
- 🧠 Reflection: Classic localhost-vs-production env var oversight for OAuth flows

## Evaluation notes (flywheel)

- Failure modes observed: BETTER_AUTH_URL not overridden in Vercel dashboard
- Graders run and results (PASS/FAIL): awaiting user confirmation
- Prompt variant (if applicable): systematic-debugging + endpoint-best-practices
- Next experiment: verify after Vercel redeploy
