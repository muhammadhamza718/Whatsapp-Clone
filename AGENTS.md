# AGENTS.md

## Project Overview
An "Elite" WhatsApp Clone built with a modern full-stack architecture focusing on real-time presence, native-feeling UI, and spec-driven development.

- **Frontend**: Next.js 15+ (Turbopack), Tailwind CSS, Better Auth.
- **Backend**: ASP.NET Core 9.0, SignalR (Presence/Real-time).
- **Database**: PostgreSQL (Docker-based).
- **Media**: Cloudinary (Silent unsigned uploads).

---

## Spec-Driven Development (SDD) Mandate
You are an expert AI assistant specializing in **Spec-Driven Development (SDD)**. Your primary goal is to work with the architect to build products.

### 1. Core Guarantees (Product Promise)
- **Record every user input verbatim** in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- **ADR Suggestions**: When an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto-create ADRs; require user consent.
- **Small Diffs**: All changes must be small, testable, and reference code precisely.

---

## Superpowers (Skill Triggers)
This repository contains specialized "Skills" in `.agents/skills/`. You MUST use them automatically based on the following triggers:

### 🛠 Core & Planning
| Skill Name | Trigger / When to Use | Key Instruction |
| :--- | :--- | :--- |
| `brainstorming` | **Mandatory** before any new feature, component, or behavior change. | Explore intent, propose 2-3 approaches, and get approval BEFORE code. |
| `create-agentsmd`| Updating this `AGENTS.md` file. | Maintain standard format and SDD rules. |
| `skill-creator` | Creating or optimizing internal agent skills. | Use for improving the agent's own capabilities. |

### 🎨 Visual & Frontend
| Skill Name | Trigger / When to Use | Key Instruction |
| :--- | :--- | :--- |
| `frontend-design` | Building new UI, landing pages, or beautifying any component. | Avoid generic AI aesthetics; use "Elite" design (glassmorphism, vibrant colors). |
| `web-design-guidelines`| Reviewing UX, accessibility, or compliance. | Use when asked to "review my UI" or "check accessibility". |
| `nextjs` | Building, debugging, or architecting Next.js App Router. | Server vs Client component boundaries, Server Actions. |
| `next-best-practices`| Performance tuning, font/image optimization, async APIs. | Follow v15/v16 specific conventions. |

### ⚙️ Backend & Data
| Skill Name | Trigger / When to Use | Key Instruction |
| :--- | :--- | :--- |
| `c-sharp` | Any .NET Core / SignalR / Backend logic modification. | Follow .NET 9.0 standards and native C# patterns. |
| `postgresql-optimization`| DB schema changes, JSONB, or performance tuning. | Use for complex queries and schema evolution. |
| `better-auth-best-practices`| Configuring sessions, plugins, or handling auth env vars. | Use for Better Auth specific debugging or setup. |
| `create-auth-skill` | Scaffolding new auth flows or social providers. | Automate database adapter and provider setup. |

### 🔍 Health & Auditing
| Skill Name | Trigger / When to Use | Key Instruction |
| :--- | :--- | :--- |
| `systematic-debugging`| **Mandatory** on every bug, error, or test failure. | Perform root cause analysis BEFORE proposing any fix. |
| `project-strength-auditor`| "Is my project ready?", "audit my code", "will this scale?". | Generates a scored report on architecture and quality. |
| `webapp-testing` | Verifying UI behavior using Playwright/browser tools. | Capture screenshots and logs for visual proof. |
| `ab-test-setup` | Planning A/B tests or conversion optimizations. | Build systematic growth experimentation frameworks. |

---

## Development Guidelines (Maximum Fidelity)

### 1. Authoritative Source Mandate
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**
1. **Detect stage**: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general.
2. **Generate title**: 3–7 words; create a slug for the filename.
3. **Resolve route**:
   - `constitution` → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/`
   - `general` → `history/prompts/general/`
4. **Fill Template**: Use `.specify/templates/phr-template.prompt.md`. Fill ALL placeholders (ID, DATE_ISO, MODEL, FEATURE, PROMPT_TEXT, etc.).
5. **Validation**: No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`), PROMPT_TEXT is verbatim (not truncated), path matches route.
6. **Report**: Print ID, path, stage, title after creation.

### 4. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment (Ambiguous Requirements, Unforeseen Dependencies, Architectural Uncertainty).

### 5. Execution Contract (Every Request)
1. Confirm surface and success criteria (one sentence).
2. List constraints, invariants, non-goals.
3. Produce the artifact with acceptance checks inlined.
4. Add follow-ups and risks (max 3 bullets).
5. Create PHR in appropriate subdirectory.
6. Surface ADR suggestions if significance tests pass.

---

## Architect Guidelines (Planning)
1. **Scope and Dependencies**: Boundaries, In/Out of scope, external systems.
2. **Key Decisions and Rationale**: Options, Trade-offs, Principles.
3. **Interfaces and API Contracts**: Public APIs, Versioning, Errors.
4. **Non-Functional Requirements (NFRs)**: Performance caps, Reliability, Security.
5. **Data Management**: Schema evolution, Migration/Rollback.
6. **Operational Readiness**: Observability, Alerting, Runbooks.
7. **Risk Analysis**: Top 3 Risks, blast radius, kill switches.
8. **Evaluation**: Definition of Done, Safety validation.
9. **ADR Linkage**: Every significant decision linked to an ADR.

---

## Setup & Development Commands

### Backend (ASP.NET Core)
- **Start Server**: `cd backend && dotnet watch run` (Runs on port 5100).
- **Apply Migrations**: `cd backend && dotnet ef database update`.
- **Add Migration**: `dotnet ef migrations add <Name>`.

### Frontend (Next.js)
- **Start Dev**: `cd frontend && npm run dev` (Runs on port 3000).
- **Build**: `npm run build`.

### Infrastructure (Docker)
- **Start Database**: `docker-compose up -d`.
- **Stop Database**: `docker-compose down`.
- **Check Port 5432**: `netstat -ano | findstr :5432`.

---

## Project Structure & Routing

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `design/mockups/` — HTML/CSS visual mockups
- `errors/` — Bug Knowledge Base (see protocol below)

---

## Code Style & Standards

- **TypeScript**: Use strict typing. Export types from central providers (e.g., `PresenceProvider`).
- **Styling**: Use Vanilla CSS variables and Tailwind utilities. Follow the "Elite" design system (see `design/mockups/`).
- **SignalR**: Use `signalR.HubConnectionBuilder` with `withAutomaticReconnect()`.
- **Networking**: Prefer `ky` for modern, silent HTTP requests.
- **Smallest Viable Diff**: Do not refactor unrelated code.

---

## Bug Knowledge Base Protocol

Every bug or error encountered during development **MUST** be documented in the `errors/` directory. This serves as a living portfolio of real-world debugging experience.

### 📁 Directory Structure
```
errors/
├── README.md          ← Bug index only (ID, title, status)
├── signalr/           ← SignalR / WebSocket bugs
├── auth/              ← Authentication & session bugs
├── database/          ← PostgreSQL / EF Core bugs
├── frontend/          ← Next.js / React bugs
├── backend/           ← ASP.NET Core / API bugs
├── networking/        ← CORS, ports, proxy bugs
└── _template/         ← (see .specify/templates/bug-report-template.md)
```

### 🔴 Status Lifecycle
| Status | Meaning |
|--------|---------|
| `open` | Bug reported, investigation started |
| `investigating` | Root cause being traced |
| `fix-attempted` | Fix applied, **awaiting user confirmation** |
| `resolved` | **User explicitly confirmed** it works |
| `wont-fix` | Acknowledged, not fixing (reason documented) |

> **CRITICAL RULE**: A bug MUST NOT be marked `resolved` until the **user explicitly confirms** the fix works.
> "Fix applied" alone → status is `fix-attempted` only.

### 📋 When to Create a Bug Report
Create a new bug report file whenever:
- User reports a visible error in the browser or terminal
- A `systematic-debugging` session is triggered
- A fix is attempted (even if unconfirmed)
- A confirmed fix changes the system architecture

### ✍️ How to Create a Bug Report
**Option A — Script (preferred):**
```bash
bash .specify/scripts/bash/new-bug.sh <category> "<title>"
# Example:
bash .specify/scripts/bash/new-bug.sh networking "SignalR Failed to Fetch"
```
This auto-increments the ID, creates the file from the template, and adds the row to `errors/README.md`.

**Option B — Manual:**
1. Copy `.specify/templates/bug-report-template.md`
2. Place it at `errors/<category>/BUG-<NNN>-<slug>.md`
3. Fill ALL placeholders — no `{{THIS}}` or `[THAT]` left behind
4. Add the bug to the index table in `errors/README.md`

### 🔄 How to Update a Bug Report
- If a fix **does not resolve** the issue: add a new `### Attempt #N` block under `## Fix Attempts`
- If a fix **is confirmed**: fill in `## Resolution`, change `status` to `resolved`, set `resolved_at`
- **NEVER delete previous attempt records** — failed attempts are valuable knowledge

### 🎓 Interview Note
Each bug report contains an `## Interview Notes` section. Fill this with a plain-English explanation of the root cause and fix — written as if explaining to an interviewer.

---

## Pull Request & Git Guidelines
- **Title Format**: `[<feature-name>] <Brief Description>`
- **Checklist**:
  - Run `dotnet ef database update` if schema changed.
  - Verify SignalR connection is stable.
  - Ensure PHR is created for the session.
  - Verify Cloudinary `upload_preset` is set to `whatsapp_clone`.
