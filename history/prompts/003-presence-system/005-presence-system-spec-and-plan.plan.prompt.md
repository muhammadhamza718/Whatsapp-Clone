---
id: 005
title: presence-system-spec-and-plan
stage: plan
date: 2026-04-24
surface: agent
model: gemini-3-flash
feature: 003-presence-system
branch: 003-presence-system
user: HP
command: none
labels: ["spec", "plan", "presence", "signalr"]
links:
  spec: specs/003-presence-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-presence-system/spec.md
 - specs/003-presence-system/plan.md
tests:
 - null
---

## Prompt

2. Presence Persistence (The Backend)
When a user disconnects (e.g., closes the tab), SignalR will detect it immediately.

Question: Should the backend also update the "Last Seen" timestamp in the database at that moment so that other users can see exactly when they were last online (e.g., "Last seen 2h ago" from the mockup)?

If the mockup designed showed this part then it would be ok if you add this 

same for this 

1. The Auto-Away Logic
In your mockup, you show a "3 of 5 minutes idle" progress bar.

Question: Do you want the system to actually display that countdown timer/bar to the user in the Profile settings, or should the "Away" status just happen silently in the background after 5 minutes of inactivity?

## Response snapshot

Created the feature specification (`spec.md`) and implementation plan (`plan.md`) for the Real-time Presence System (SignalR). The plan includes auto-away logic with a visual timer and database persistence for "Last Seen" status, as requested and confirmed by the user based on the mockup.

## Outcome

- ✅ Impact: Established a full-stack design for real-time presence.
- 🧪 Tests: n/a
- 📁 Files: Created spec.md and plan.md in specs/003-presence-system/
- 🔁 Next prompts: Generate implementation tasks.
- 🧠 Reflection: Successfully incorporated specific visual feedback (progress bar) and backend persistence requirements into the SDD artifacts.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
