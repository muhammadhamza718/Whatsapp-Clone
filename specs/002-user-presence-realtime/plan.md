# Implementation Plan: Phase 2 — User Profiles & Presence

**Branch**: `002-user-presence-realtime` | **Date**: 2026-04-26  
**Spec**: [specs/002-user-presence-realtime/spec.md](file:///f:/Courses/Hamza/WhatsApp%20Clone/specs/002-user-presence-realtime/spec.md)

## Summary
Complete Phase 2 by bridging the current "volatile" SignalR presence system with permanent PostgreSQL persistence. This plan covers the creation of the `User` model in the backend, mapping it to the existing Better Auth table, and implementing robust multi-device disconnect logic.

## Technical Context
- **Backend**: ASP.NET Core 9.0, SignalR.
- **Frontend**: Next.js 15, Better Auth.
- **Database**: PostgreSQL (Docker).
- **Constraints**: 500ms broadcast latency, dual-stack binding (IPv4/IPv6).

## Proposed Changes

### [Component] Backend Data Layer
We must map the `User` table created by Better Auth into the .NET `AppDbContext`.

#### [NEW] [User.cs](file:///f:/Courses/Hamza/WhatsApp%20Clone/backend/Models/User.cs)
- Define `User` class matching Better Auth schema (`id`, `name`, `email`, `image`).
- Add custom fields: `Status` (string) and `LastSeenAt` (DateTime).

#### [MODIFY] [AppDbContext.cs](file:///f:/Courses/Hamza/WhatsApp%20Clone/backend/Data/AppDbContext.cs)
- Add `DbSet<User> Users`.
- Map the table name to match Better Auth (usually `user`).

### [Component] Presence Logic
Refactor `PresenceHub` to handle persistence and multi-device connection counting.

#### [MODIFY] [PresenceHub.cs](file:///f:/Courses/Hamza/WhatsApp%20Clone/backend/Hubs/PresenceHub.cs)
- **Static Connection Tracker**: Use a `ConcurrentDictionary<string, HashSet<string>>` to track connection IDs per User ID.
- **OnConnected**: 
  - Add connection to user's set.
  - If it's the 1st connection, update DB to `online` and broadcast.
- **OnDisconnected**:
  - Remove connection from user's set.
  - If it's the LAST connection, update DB `LastSeenAt`, set `Status` to `offline`, and broadcast.
- **UpdateStatus**: Persist manual status changes (Away/Online) to DB.

### [Component] Frontend Integration
Ensure the UI reflects the real-time changes and handles reconnection gracefully.

#### [MODIFY] [PresenceProvider.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/lib/presence/PresenceProvider.tsx)
- Ensure the SignalR URL includes the correct userId (already implemented).
- Handle `UserStatusChanged` events to update the local state for other users (Phase 3 readiness).

## Risk & Mitigation
| Risk | Mitigation |
| :--- | :--- |
| **Schema Mismatch** | Verify Better Auth table name (is it `user` or `users`?) before mapping in EF Core. |
| **Zombie Connections** | Use `withAutomaticReconnect()` on client and `withKeepAliveInterval` on server. |
| **High DB Load** | Implement a background service for batching `LastSeenAt` updates if broadcast volume is high. |

## Verification Plan
1. **Database Check**: Log in, disconnect, and run `SELECT * FROM users;` in PostgreSQL to verify `Status` and `LastSeenAt` are updated.
2. **Multi-Tab Test**: Open two tabs for User A. Close one. Verify User A remains "Online" for other users. Close both. Verify User A goes "Offline".
3. **Auto-Away Test**: Wait 5 minutes without activity. Verify DB status changes to `away`.
