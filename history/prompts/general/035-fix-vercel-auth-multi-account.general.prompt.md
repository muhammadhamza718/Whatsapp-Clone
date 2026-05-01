---
id: 35
title: Fix Vercel Auth Multi-account and Redis Errors
stage: plan
date_iso: 2026-05-01
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: HP
command: none
labels: ["auth", "google-oauth", "vercel", "redis", "signalr"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - f:\Courses\Hamza\WhatsApp Clone\backend\Program.cs
  - f:\Courses\Hamza\WhatsApp Clone\frontend\lib\auth.ts
tests_yaml:
  - Manual verification of Google Cloud settings
---

## PROMPT_TEXT
I dont know why when i tried to logged in with 2 accounts on locally on all live servers like frontend backend docker postgreSQL 

its is working properly fine 
i can successfully logged in 2 account with 2 browser using 1 acc in google browser and 2 acc in microsoft edge browser 

its worked fine for me i can even chat with both of them 

but when i am trying this on vercel its not working 
I am trying to logged in with 1 google account which has this email "mhamza771188@gmail.com" 

but i logged out and try another google account like "mhamza77188@gmail.com" 

i can't logged in with this account and i even tried to register first with continuing with google account 
and then i even tried to logged in back with the same account its just sends back in the login page 

there are no error logs in vercel and railway logs are unreadable So i downloaded it in json @[logs.1777652081810.json]

And i can see only one "mhamza771188@gmail.com" user in neon PostgreSQL database table 


So can you tell me what the issue here?

@[/systematic-debugging]

## RESPONSE_TEXT
I've completed a systematic investigation into why authentication is failing for multiple accounts on Vercel while working locally.

### 🔍 Root Cause Investigation

1. **Google OAuth "Testing" Mode (Primary Suspect):** The behavior points strongly to the Google Cloud Project being in "Testing" status, restricting logins to authorized "Test users".
2. **Vercel BETTER_AUTH_URL Mismatch:** If BETTER_AUTH_URL is missing or incorrect on Vercel, cookies fail to persist, causing redirect loops.
3. **Backend Redis Connection Errors:** Backend logs show constant timeouts trying to connect to localhost:6379 in production.

### 📋 Proposed Solution
Created an implementation plan to:
- Provide instructions for Google Cloud Console (add test users or publish).
- Hardcode-fix backend Redis connection logic.
- Harden frontend auth configuration.

## OUTCOME
Plan created and awaiting user approval. Root cause identified as likely Google Cloud Console configuration and Vercel environment variables mismatch.
