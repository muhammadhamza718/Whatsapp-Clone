# Implementation Plan: Real-Time Presence Integration

**Branch**: `presence-sidebar-integration` | **Date**: 2026-04-26 | **Spec**: `/specs/presence-integration/spec.md`
**Input**: Feature specification from `/specs/presence-integration/spec.md`

## Summary
Replace mock data in the frontend sidebar with real user data from the database and enable real-time status updates via SignalR. This will be achieved by creating a new `GET /api/users` endpoint in the ASP.NET Core backend and updating the React sidebar component to fetch this data and listen for SignalR events.

## Technical Context

**Language/Version**: C# (.NET 10.0), TypeScript (Next.js 15)
**Primary Dependencies**: EF Core, SignalR, Better-Auth, Ky
**Storage**: PostgreSQL
**Testing**: Manual verification with multi-browser sessions
**Target Platform**: Local development (Docker)
**Project Type**: Web application (Frontend + Backend)

## Project Structure

### Documentation (this feature)

```text
specs/presence-integration/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task list
```

### Source Code (repository root)

```text
backend/
├── Controllers/
│   └── UsersController.cs   # [NEW] Endpoint for user listing
└── Data/
    └── AppDbContext.cs      # [EXISTING] User entity access

frontend/
├── lib/
│   └── presence/
│       └── PresenceProvider.tsx  # [EXISTING] SignalR subscription logic
└── app/(dashboard)/components/
    └── ChatSidebar.tsx      # [MODIFY] Fetch real users and update UI
```

## Technical Approach

### Backend
1. **New Controller**: Create `UsersController.cs` with an `[Authorize]` attribute.
2. **Endpoint**: `GET /api/users` will:
   - Use `HttpContext` to get the current user's ID.
   - Query `AppDbContext.Users` for all users EXCEPT the current user.
   - Return a DTO (Data Transfer Object) containing `id`, `name`, `email`, `image`, `status`, and `lastSeenAt`.

### Frontend
1. **Data Fetching**: 
   - Update `ChatSidebar.tsx` to use `useEffect` and `ky` to fetch users on mount.
   - Store users in a local state `users`.
2. **SignalR Integration**:
   - Access the SignalR connection from `PresenceProvider.tsx` (may need to expose the connection object or create an event listener).
   - Listen for `UserStatusChanged(userId, status)`.
   - Update the `users` state in `ChatSidebar.tsx` when a status change is received.
3. **UI Update**:
   - Map over the `users` state instead of `MOCK_CHATS`.
   - Use `Avatar` component props (`status`, `showDot`) based on the fetched data.
   - Use `formatDistanceToNow` for the `lastSeenAt` display.

## Success Criteria Checklist
- [ ] Users can see real accounts in the sidebar.
- [ ] Indicators change color instantly when another user connects/disconnects.
- [ ] No "ghost" users or duplicate listings.
