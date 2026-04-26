---
description: [EXPERT] Execute implementation planning with high-fidelity architecture design.
handoffs: 
  - label: Create Tasks
    agent: sp.tasks
    prompt: Break this expert plan into testable tasks.
---

## 🏗️ Expert Planning Workflow (sp.plan)

1. **Context Initialization**:
   - Run `.specify/scripts/bash/setup-plan.sh --json`.
   - Parse `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`.

2. **Phase 0: Deep Research**:
   - **SignalR Topologies**: Evaluate Hub vs Group broadcasting.
   - **PostgreSQL Mapping**: Map the Better Auth `users` table to C# models.
   - **Lessons Learned**: Incorporate BUG-001 (IPv6 binding) and BUG-002 (SignalR state guards).

3. **Phase 1: High-Fidelity Design**:
   - **Data-Model**: Define `User` extensions for `LastSeenAt` and `Status`.
   - **Contracts**: Define SignalR Hub methods (`UpdateStatus`, `OnUserStatusChanged`).
   - **Architecture Diagram**: (Textual) Describe the flow from Client activity -> Provider -> Hub -> DB -> Broadcast.

4. **Risk & Mitigation**:
   - **Risk 1**: DB connection bottleneck during mass disconnects. *Mitigation: Use batch updates or debouncing.*
   - **Risk 2**: "Ghosting" in multi-tab scenarios. *Mitigation: Connection counting in Hub.*

5. **Stop and Report**:
   - Output `research.md`, `data-model.md`, and the main `plan.md`.

---
As the main request completes, create a PHR in `history/prompts/plan/`.
