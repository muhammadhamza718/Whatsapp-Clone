---
id: 59
title: "Debugging Google Auth: Missing 'expires_at' Column"
stage: misc
date_iso: 2026-05-03
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: Hamza
command: systematic-debugging
labels: ["auth", "better-auth", "postgresql", "schema-error"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - backend/Data/AppDbContext.cs
  - database_sync.sql
---

## PROMPT_TEXT
@[TerminalName: node, ProcessId: 16572] @[TerminalName: dotnet, ProcessId: 18448] 
Why I am having a error 
I was trying to continue with google 
@[/systematic-debugging]

## RESPONSE_TEXT
I identified the root cause as a database schema mismatch where Better Auth expects a snake_case column "expires_at" in the "verification" table, but it is missing. I've initiated a Systematic Debugging session starting with investigating the database context and recent migration history.

## OUTCOME
Investigation initiated to verify the "verification" table schema.
