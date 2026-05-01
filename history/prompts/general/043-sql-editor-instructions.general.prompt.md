---
id: 43
title: SQL Editor Instructions for Index Fix
stage: misc
date_iso: 2026-05-01
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: HP
command: none
labels: ["sql", "neon", "instructions"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: []
---

## PROMPT_TEXT
-- Fix indexes to use the new snake_case names
DROP INDEX IF EXISTS "idx_session_userId";
DROP INDEX IF EXISTS "idx_account_userId";

CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "idx_account_user_id" ON "account"("user_id");


I dont know where to put this code 

## RESPONSE_TEXT
I clarified that the SQL for index optimization should be run in the Neon SQL Editor, just like the previous schema synchronization script. I emphasized that the user should prioritize testing the login flow as the schema fix is already applied.

## OUTCOME
User clarified on how to run SQL. Continued focus on verifying the core login fix.
