---
id: BUG-003
title: "EF Core & Better Auth PostgreSQL Case Mismatch"
category: database
status: resolved
reported_at: 2026-04-26
resolved_at: 2026-04-26
tags: [postgresql, ef-core, better-auth, case-sensitivity]
---

# 🐛 BUG-003: EF Core & Better Auth PostgreSQL Case Mismatch

## 📋 Summary
> Better Auth created PostgreSQL columns in lowercase (`id`, `name`), but EF Core by default generated queries using PascalCase (`"Id"`, `"Name"`), causing PostgreSQL to reject the queries with `42703: column does not exist`.

---

## 🏗️ System Context
> Describe HOW the system works in this area. Future readers (interviewers, other agents) need to understand the architecture BEFORE understanding the bug.

### Architecture Involved
- **Frontend**: Better Auth configuration (`auth.ts`)
- **Backend**: Entity Framework Core Models (`User.cs`, `AppDbContext.cs`)
- **Infrastructure**: PostgreSQL Database

### How This Part of the System Works
Better Auth automatically creates and manages standard authentication tables (like `user`, `session`) in PostgreSQL, defining the schema using typical TypeScript naming conventions (camelCase/lowercase). On the ASP.NET Core backend, we mirror the `user` table using a C# `User` class to integrate it with EF Core for our own logic. By default, EF Core maps C# properties to table columns using the exact spelling and casing of the C# property (e.g., `public string Email` maps to the column `"Email"`).

---

## 🚨 The Error

### What Happened
When the ASP.NET Core backend attempted to retrieve or update a `User` entity from PostgreSQL via EF Core, the query failed. Similarly, when Better Auth tried to insert a new user via the Next.js frontend, it crashed because the backend had not yet created additional required columns (`status`, `lastSeenAt`) in the database.

### Error Message / Stack Trace
```
2026-04-26T16:12:45.396Z ERROR [Better Auth]: Failed to create user error: column "status" of relation "user" does not exist

(And on the backend:)
42703: column u.Email does not exist
Hint: Perhaps you meant to reference the column "u.email".
```

### Steps to Reproduce
1. Configure Better Auth to manage PostgreSQL.
2. Define a C# EF Core model mimicking the Better Auth `user` table using PascalCase properties.
3. Run an EF Core `.FindAsync(userId)` query or let Better Auth try to insert a record into custom fields.
4. The system crashes with Postgres Error `42703`.

### Environment
- **OS**: Windows 11
- **Frontend**: Next.js 15, Better Auth
- **Backend**: ASP.NET Core 9.0, EF Core 9.0
- **Database**: PostgreSQL 

---

## 🔍 Investigation Log

### Phase 1: Root Cause Investigation
> What evidence was gathered? What was checked?

#### Evidence Gathered
- ✅ Verified `status` and `lastSeenAt` were added to C# `User` model.
- ❌ Checked PostgreSQL schema: the columns did not exist.
- ✅ Verified EF Core generates SQL using quoted PascalCase identifiers: `SELECT u."Email"`.
- ✅ Verified PostgreSQL treats quoted identifiers as case-sensitive.

#### Initial Hypothesis
> "I think EF Core is requesting PascalCase columns from a database where Better Auth created lowercase columns, and this case mismatch is the root cause because PostgreSQL is case-sensitive when quotes are used."

### Phase 2: Pattern Analysis
> What similar working code was found? What's different?
ASP.NET Core projects using PostgreSQL (`Npgsql`) frequently employ the `EFCore.NamingConventions` library specifically to resolve this impedance mismatch by forcing EF Core to use lowercase or snake_case automatically.

### Phase 3: Hypothesis Testing
> What minimal change was made to test the hypothesis?
Manually applying `[Column("id")]` and `[Column("status")]` to the C# model fixed the issue for those specific properties, confirming that EF Core casing was indeed the root cause.

---

## 🔧 Fix Attempts

### Attempt #1
- **Date**: 2026-04-26
- **Hypothesis**: Surgical attribute mapping.
- **Change Made**: Added `[Column("...")]` to `Id`, `Status`, and `LastSeenAt`.
- **Result**: Partially successful, but EF Core still threw `42703` for the unmapped `Email` column during subsequent queries.
- **User Verdict**: Failed.

---

## ✅ Resolution

> **Status**: 🟢 Resolved

### Confirmed Fix
Implemented the `EFCore.NamingConventions` library to apply `.UseLowerCaseNamingConvention()` globally across the DbContext.

### Root Cause (Final Verdict)
Impedance mismatch between TypeScript schema generation (lowercase) and C# EF Core default conventions (PascalCase), enforced by PostgreSQL's strict case sensitivity on quoted identifiers.

### What We Learned
> Key takeaway for future agents and interviews.
When building full-stack applications where different ORMs or ecosystems (like Better Auth and EF Core) share the same PostgreSQL database, always configure a unified naming convention (like lower_snake_case or lowercase) globally on the C# side to prevent infinite case-mismatch bugs.

### Files Changed
| File | Change |
|------|--------|
| `backend/ChatApp.Api.csproj` | Added `EFCore.NamingConventions` package |
| `backend/Program.cs` | Added `.UseLowerCaseNamingConvention()` to Npgsql options |
| `backend/Models/User.cs` | Removed manual `[Column]` attributes |
| `backend/Migrations/*` | Generated and applied EF Core migration |

---

## 🎓 Interview Notes
> If you had to explain this bug and fix in an interview, what would you say?

"I encountered a classic impedance mismatch between two ecosystems sharing a PostgreSQL database. The frontend auth library, Better Auth, generated the database tables using lowercase columns like 'email' and 'name'. However, our ASP.NET Core backend used Entity Framework Core, which defaults to PascalCase. Because EF Core quotes its identifiers, PostgreSQL treated them as case-sensitive, leading to 'column does not exist' crashes. Rather than patching individual properties with attributes, I implemented the `EFCore.NamingConventions` library and configured the DbContext to use `.UseLowerCaseNamingConvention()`. This permanently synced the C# backend to the database schema generated by the frontend."
