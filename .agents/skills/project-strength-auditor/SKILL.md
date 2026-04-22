---
name: project-strength-auditor
description: >
  Audits how strong a full-stack project's foundation really is. Use this skill whenever the user
  wants to know if their project is solid, asks about code quality, wants to find weak points before
  shipping, says things like "is my project ready", "how good is my codebase", "will this scale",
  "audit my project", "check my project", "test my features", or "how strong is my base". Also
  trigger when user shares a project and asks if it can handle future features, or wants a health
  report on their stack. Runs real commands + static analysis, generates test cases automatically,
  produces a scored report, verifies every fix it recommends, and writes a persistent audit log so
  runs can be compared over time.
---

# Project Strength Auditor

A skill that audits full-stack projects (Next.js + FastAPI, React + Express, etc.) for real
foundation strength — not just "does it run" but "will it hold up."

---

## Two Modes

**Default Mode (Hybrid Audit)**
Read codebase → auto-generate test cases → run real checks → scored report + verified fixes.

**Deep Mode** (`--deep` flag or user says "deep audit")
Everything in default mode, PLUS writes new test files (`*.test.ts`, `test_*.py`) permanently
into the project. Requires explicit user confirmation before any files are written.

---

## Step 1 — Environment Check (always first)

Before scoring anything, verify the environment is set up. Separate env problems from code problems.

```bash
# Check Node
node --version && npm --version

# Check Python
python --version || python3 --version

# Check deps installed
[ -d node_modules ] && echo "node_modules: OK" || echo "node_modules: MISSING — run npm install"
[ -d .venv ] || [ -d venv ] && echo "venv: OK" || echo "venv: NOT FOUND"
```

If env issues are found, report them separately under `⚙️ Environment Issues` — do NOT let them
affect the code score. Tell the user to fix them first if they block running checks.

---

## Step 2 — Codebase Scan

Read the project structure. Use `find` to map it out before reading files.

```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.py" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/__pycache__/*" \
  ! -path "*/.git/*" \
  ! -path "*/coverage/*" \
  ! -path "*/.venv/*" \
  ! -path "*/venv/*"
```

Also check for:
- `README.md` / `docs/` — extract any described features
- `TODO`, `ROADMAP.md`, inline `// TODO` and `# TODO` comments — these become planned feature tests
- `package.json` scripts — what test/lint/build commands exist
- `pyproject.toml` / `requirements.txt` — Python tooling

---

## Step 3 — Auto-Generate Test Cases

After reading the codebase, generate test cases across four dimensions. Each test case has:

```
ID: TST-001
Dimension: Feature Completeness | Code Quality | Scalability | Future-Proofing
Target: what file/feature/pattern is being tested
Method: static | command | both
Check: what exactly is being verified
Expected: what passing looks like
```

### Dimension Guide

**Feature Completeness** — does each feature work end-to-end?
- Does every API route have a corresponding frontend call?
- Are form submissions wired to real handlers?
- Do auth flows have both protection and redirect?
- Are error states handled or silently swallowed?

**Code Quality** — structure, patterns, best practices
- Run `tsc --noEmit` (TypeScript) — zero errors expected
- Run `eslint .` or `next lint` — check for critical warnings
- Run `mypy .` or `ruff check .` (Python) — type + lint errors
- Check for hardcoded secrets, API keys, or `console.log` left in production paths
- Check for deeply nested logic (>3 levels) that should be extracted

**Scalability** — will it hold up as the project grows?
- Is database access centralized or scattered across components?
- Are there N+1 query patterns (loops with DB calls inside)?
- Is state management local-only when it should be global?
- Are large data fetches paginated or unbounded?

**Future-Proofing** — can planned features be added without breaking what's there?
- Sources: README features marked as "coming soon", TODO comments, ROADMAP file, user description
- For each planned feature: does the current architecture have the hooks to support it?
- Flag any area where adding Feature X would require rewriting something core

---

## Step 4 — Run the Checks

For each test case with `method: command` or `method: both`, run the actual commands.

Always capture both stdout and stderr. Never silently skip a failed command.

```bash
# TypeScript type check
npx tsc --noEmit 2>&1

# Next.js lint
npx next lint 2>&1

# Run existing test suite
npm test -- --watchAll=false 2>&1
# or
npx jest --passWithNoTests 2>&1

# Python type check
python -m mypy . --ignore-missing-imports 2>&1

# Python lint
python -m ruff check . 2>&1

# Run existing Python tests
python -m pytest -v 2>&1
```

Evaluate each output. Mark test case as:
- ✅ PASS — check succeeded, no issues found
- ❌ FAIL — issues found, needs fix
- ⚠️ WARN — not a failure but worth noting
- ⏭️ SKIP — command not available in this environment (note why)

---

## Step 5 — Score Calculation

Score each dimension out of 25. Total is out of 100.

| Dimension | Weight |
|---|---|
| Feature Completeness | 25 |
| Code Quality | 25 |
| Scalability | 25 |
| Future-Proofing | 25 |

Within each dimension: `score = (passed / total_tests) * 25`

Round to nearest integer. Show breakdown per dimension.

**Score labels:**
- 90–100 → 🟢 Solid Foundation
- 70–89 → 🟡 Good Base, Minor Gaps
- 50–69 → 🟠 Needs Work Before Scaling
- Below 50 → 🔴 Fragile — Fix Before Adding Features

---

## Step 6 — Report Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PROJECT STRENGTH AUDIT
  [Project Name] — [Date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  OVERALL SCORE: 74/100 🟡

  Feature Completeness   18/25
  Code Quality           20/25
  Scalability            16/25
  Future-Proofing        20/25

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TEST RESULTS (N tests run)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ TST-001  TypeScript compiles clean
  ❌ TST-004  API route /api/auth/logout has no error handler
  ⚠️  TST-007  3 console.log calls found in production paths
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VERIFIED FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  FIX-001 → TST-004
  Problem:  [exact description]
  File:     src/app/api/auth/logout/route.ts
  Fix:      [exact code change to make]
  Verified: Re-ran TST-004 after applying fix → ✅ PASS

  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚙️ ENVIRONMENT ISSUES (if any)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 7 — Verified Fix Protocol

For every FAIL, propose a fix. Then verify it.

1. State the exact change (file, line range, before/after code)
2. Apply the fix (or instruct user to apply it)
3. Re-run the specific test case that failed
4. Report the result:
   - ✅ Fix confirmed — test now passes
   - ❌ Fix insufficient — test still fails, here's the updated fix
5. Never mark a fix as "verified" without actually re-running the test

If a fix cannot be auto-verified (e.g., it requires a running server or live DB), say:
> "This fix cannot be auto-verified in static mode. Manual verification required: [exact steps]."

---

## Step 8 — Write Audit Log

After every run, append to `.audit/log.json` in the project root. Create the file if it doesn't exist.

```json
{
  "runs": [
    {
      "timestamp": "2025-04-22T10:30:00Z",
      "score": 74,
      "breakdown": {
        "feature_completeness": 18,
        "code_quality": 20,
        "scalability": 16,
        "future_proofing": 20
      },
      "tests_run": 24,
      "passed": 18,
      "failed": 4,
      "warned": 2,
      "skipped": 0,
      "mode": "default",
      "tests": [
        {
          "id": "TST-001",
          "dimension": "Code Quality",
          "target": "TypeScript compilation",
          "result": "PASS",
          "notes": ""
        },
        {
          "id": "TST-004",
          "dimension": "Feature Completeness",
          "target": "/api/auth/logout error handling",
          "result": "FAIL",
          "notes": "No try/catch, unhandled promise rejection possible"
        }
      ],
      "fixes_verified": [
        {
          "fix_id": "FIX-001",
          "test_id": "TST-004",
          "verified": true
        }
      ]
    }
  ]
}
```

**On every run:** read existing log first. Show a comparison delta if a previous run exists:

```
  vs last run (3 days ago):
  Score:  68 → 74  (+6) ✅
  Failed: 7  → 4   (-3) ✅
  Warned: 1  → 2   (+1) ⚠️
```

Add `.audit/` to `.gitignore` only if the user asks. By default leave it trackable so the history persists in git.

---

## Deep Mode — Additional Steps

Only activate when user says `--deep` or explicitly asks for a deep audit.

Before writing any files, show this confirmation:
```
Deep Mode will write test files to your project:
  - src/__tests__/[feature].test.ts  (for each untested feature)
  - tests/test_[module].py           (for each untested Python module)

These will appear in your git diff. Continue? (yes/no)
```

Only proceed after explicit "yes."

Generated test files follow existing project conventions (check existing test files for style first).
After writing, run the new test suite and include results in the report.

---

## Key Rules

- Never read `node_modules`, `.next`, `dist`, `build`, `__pycache__`, `.git`, `coverage`, `.venv`, `venv`
- Never mark a test FAIL due to a missing env var or uninstalled dep — that goes in Environment Issues
- Never claim a fix is verified without re-running the test
- Always read `.audit/log.json` at the start to surface history
- Future feature tests come only from README, TODO comments, ROADMAP files, or user description — never predicted
- Planned features that don't exist yet are marked `PLANNED` not `FAIL`