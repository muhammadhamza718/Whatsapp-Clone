---
id: 60
title: "Resolution of Google Auth Schema Mismatch"
stage: green
date_iso: 2026-05-03
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: Hamza
command: implementation
labels: ["auth", "better-auth", "postgresql", "schema-fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - scratch/db-sync-fix.js
---

## PROMPT_TEXT
(Following the systematic-debugging session for the Google Auth 500 error)

## RESPONSE_TEXT
I diagnosed the issue as a camelCase vs snake_case mismatch between the database and Better Auth configuration. I created a custom Node.js script that renames all necessary columns in the user, session, account, and verification tables. I executed this script against the local database, successfully syncing the schema.

## OUTCOME
Database schema updated to snake_case. Google Auth should now work successfully.
