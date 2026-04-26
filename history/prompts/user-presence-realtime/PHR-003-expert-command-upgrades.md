---
id: PHR-003
date: 2026-04-26
model: antigravity (Gemini 2.0 Pro)
stage: plan
feature: user-presence-realtime
title: Expert Command Upgrades and Phase 2 Persistence
---

# Prompt History Record (PHR-003)

## Verbatim Prompt
> You are an Expert Software Architect with deep experience in full-stack development, spec-driven development.
> Your job is to help me create a @[.claude/commands/sp.specify.md] by using @[.specify/templates/spec-template.md] and also @[.claude/commands/sp.plan.md] by using the @[.specify/templates/plan-template.md] in detailed by covering the whole @[f:\Courses\Hamza\WhatsApp Clone\realtime-chat-phases.md:L48-L62] phase-2 and complete the only phase-2 and identifying risks early.
> 
> Think Harder

## Response Summary
1.  **Command Upgrades**: Refactored `.claude/commands/sp.specify.md` and `sp.plan.md` to "Expert Architect" level, incorporating advanced SDD principles, journey mapping, and failure mode analysis.
2.  **Phase 2 Specification**: Generated a high-fidelity spec in `specs/002-user-presence-realtime/spec.md` covering real-time presence, auto-away logic, and multi-device edge cases.
3.  **Implementation Plan**: Created a detailed plan in `specs/002-user-presence-realtime/plan.md` focusing on bridging the frontend and backend for DB persistence.
4.  **Database Mapping**: Implemented the `User` model in C# to map directly to the Better Auth PostgreSQL `user` table.
5.  **SignalR Persistence**: Refactored `PresenceHub.cs` to include thread-safe connection counting (multi-tab support) and automatic database updates for `status` and `lastSeenAt`.
6.  **Verification**: Confirmed backend compilation and updated the project checklist.

## Path
`history/prompts/user-presence-realtime/PHR-003-expert-command-upgrades.md`
