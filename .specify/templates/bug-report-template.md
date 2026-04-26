---
id: BUG-{{ID}}
title: "{{TITLE}}"
category: {{CATEGORY}}
# Categories: signalr | auth | database | frontend | backend | networking | other
status: open
# Status: open | investigating | fix-attempted | resolved | wont-fix
reported_at: {{DATE_ISO}}
resolved_at: ~
tags: [{{TAGS}}]
# Example tags: [cors, signalr, localhost, ipv6, dotnet]
---

# 🐛 BUG-{{ID}}: {{TITLE}}

## 📋 Summary
> One sentence describing the bug and its user-facing impact.

{{SUMMARY}}

---

## 🏗️ System Context
> Describe HOW the system works in this area. Future readers (interviewers, other agents) need to understand the architecture BEFORE understanding the bug.

### Architecture Involved
- **Frontend**: {{FRONTEND_COMPONENT}} (e.g., `PresenceProvider.tsx`, `ProfileModal.tsx`)
- **Backend**: {{BACKEND_COMPONENT}} (e.g., `PresenceHub.cs`, `Program.cs`)
- **Infrastructure**: {{INFRA}} (e.g., Docker PostgreSQL, Cloudinary CDN)

### How This Part of the System Works
{{SYSTEM_EXPLANATION}}
<!-- Example:
The PresenceProvider uses SignalR to establish a WebSocket connection to the ASP.NET Core 
backend at `http://localhost:5100/hubs/presence`. It derives the URL by stripping `/api` 
from the `NEXT_PUBLIC_API_URL` env variable. The backend uses Kestrel and is bound to 
`0.0.0.0:5100`, which means it listens only on IPv4 loopback.
-->

---

## 🚨 The Error

### What Happened
{{ERROR_DESCRIPTION}}
<!-- Describe what the user observed -->

### Error Message / Stack Trace
```
{{ERROR_MESSAGE}}
```

### Steps to Reproduce
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_N}}

### Environment
- **OS**: Windows 11
- **Browser**: {{BROWSER}}
- **Frontend**: Next.js 15 on `http://localhost:3000`
- **Backend**: ASP.NET Core 9.0 on `http://localhost:5100`
- **Docker**: PostgreSQL 18

---

## 🔍 Investigation Log

### Phase 1: Root Cause Investigation
> What evidence was gathered? What was checked?

{{PHASE_1_NOTES}}

#### Evidence Gathered
- ✅ / ❌ {{CHECK_1}}
- ✅ / ❌ {{CHECK_2}}
- ✅ / ❌ {{CHECK_N}}

#### Initial Hypothesis
> "I think X is the root cause because Y."

{{INITIAL_HYPOTHESIS}}

### Phase 2: Pattern Analysis
> What similar working code was found? What's different?

{{PHASE_2_NOTES}}

### Phase 3: Hypothesis Testing
> What minimal change was made to test the hypothesis?

{{PHASE_3_NOTES}}

---

## 🔧 Fix Attempts

### Attempt #1
- **Date**: {{DATE}}
- **Hypothesis**: {{HYPOTHESIS}}
- **Change Made**:
  ```diff
  {{DIFF}}
  ```
- **Result**: 🟠 Awaiting user verification
- **User Verdict**: ⏳ Pending

---
<!-- Add more attempts below if first fix fails: -->

<!--
### Attempt #2
- **Date**: {{DATE}}
- **Hypothesis**: {{HYPOTHESIS}}
- **Change Made**: ...
- **Result**: ...
- **User Verdict**: ...
-->

---

## ✅ Resolution

> **Status**: 🔴 Open / 🟠 Fix-Attempted / 🟢 Resolved

### Confirmed Fix
{{CONFIRMED_FIX}}
<!-- Only filled in when user says "it works" -->

### Root Cause (Final Verdict)
{{ROOT_CAUSE}}

### What We Learned
> Key takeaway for future agents and interviews.

{{LESSON_LEARNED}}

### Files Changed
| File | Change |
|------|--------|
| `{{FILE_1}}` | {{CHANGE_1}} |
| `{{FILE_2}}` | {{CHANGE_2}} |

---

## 🎓 Interview Notes
> If you had to explain this bug and fix in an interview, what would you say?

{{INTERVIEW_TALKING_POINTS}}
<!-- Example:
"I encountered an IPv4/IPv6 mismatch between the browser's resolution of 'localhost' 
and the Kestrel server's binding. Modern Windows browsers prefer ::1 (IPv6) for localhost, 
but our ASP.NET Core backend was bound to 0.0.0.0 (IPv4 only). The fix was to change the 
frontend env var to explicitly use 127.0.0.1 to force IPv4."
-->
