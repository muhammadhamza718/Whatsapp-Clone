---
id: 40
title: Fix unable_to_create_user by Correcting Column Mapping
stage: misc
date_iso: 2026-05-01
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: HP
command: none
labels: ["auth", "database", "postgresql", "mapping", "fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - f:\Courses\Hamza\WhatsApp Clone\frontend\lib\auth.ts
---

## PROMPT_TEXT
its still not doing anything 

I am keep pressing the continue with google buttons but seems like its totallly not working 

[Screenshot of Vercel logs showing "unable_to_create_user"]

## RESPONSE_TEXT
I identified the root cause from the Vercel logs: the `unable_to_create_user` error is caused by a column naming mismatch between Better Auth (which defaults to snake_case for PG) and the camelCase columns I previously provided.

I've provided a SQL script to rename the columns to snake_case in Neon and I'm updating `auth.ts` to explicitly map these fields to ensure 100% compatibility.

## OUTCOME
Database column naming mismatch identified and fix provided. Code being updated to map fields explicitly.
