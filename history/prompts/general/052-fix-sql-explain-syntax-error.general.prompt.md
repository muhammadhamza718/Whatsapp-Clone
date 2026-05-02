---
id: 52
title: "Fix: SQL Syntax Error (EXPLAIN used with DO block)"
stage: misc
date_iso: 2026-05-02
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: Hamza
command: none
labels: ["database", "postgresql", "syntax-error", "fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: []
---

## PROMPT_TEXT
[User reports syntax error at or near "DO" because they added EXPLAIN prefix]

## RESPONSE_TEXT
I explained that `EXPLAIN` cannot be used with anonymous `DO` blocks in PostgreSQL and provided the cleaned-up script for execution.

## OUTCOME
Syntax error corrected. Script ready for execution.
