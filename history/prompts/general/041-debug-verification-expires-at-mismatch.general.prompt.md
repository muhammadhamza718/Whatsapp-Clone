---
id: 41
title: "Debug: verification.expires_at Column Mismatch"
stage: misc
date_iso: 2026-05-01
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: HP
command: none
labels: ["systematic-debugging", "postgresql", "better-auth", "schema-sync"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - f:\Courses\Hamza\WhatsApp Clone\frontend\lib\auth.ts
---

## PROMPT_TEXT
[Error Log: column "expires_at" of relation "verification" does not exist]

The continue with google button is not even processing nor working properly 

@[/systematic-debugging]
@[/endpoint-best-practices]
@[/project-strength-auditor]

## RESPONSE_TEXT
I identified that the `expires_at` error is a direct result of the code being updated to snake_case while the database still holds camelCase columns. I provided the consolidated RENAME SQL script again and explained why this synchronization is the final blocker for the Google login flow.

## OUTCOME
Root cause confirmed: code/DB out of sync. User instructed to run RENAME SQL in Neon Console. Audit score updated to 75/100.
