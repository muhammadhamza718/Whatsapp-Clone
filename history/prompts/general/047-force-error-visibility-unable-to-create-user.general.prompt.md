---
id: 47
title: Force Error Visibility for unable_to_create_user
stage: misc
date_iso: 2026-05-01
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: Hamza
command: none
labels: ["debug", "better-auth", "vercel", "logging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - f:\Courses\Hamza\WhatsApp Clone\frontend\lib\auth.ts
---

## PROMPT_TEXT
[User reports social login redirects to /register and shows unable_to_create_user error]

## RESPONSE_TEXT
I've identified that the `unable_to_create_user` error is causing a redirect loop to `/register`. To find the root cause, I'm upgrading the Better Auth logger to force all internal messages to `console.error` so they bypass Vercel's log filtering and show the exact database constraint violation.

## OUTCOME
Auth logger upgraded to force error visibility. Awaiting new logs to identify specific DB failure.
