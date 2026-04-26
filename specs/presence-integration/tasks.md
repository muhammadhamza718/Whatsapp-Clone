# Tasks: Real-Time Presence Integration

**Input**: Design documents from `/specs/presence-integration/`
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Foundational (Backend)

**Purpose**: Provide the API necessary for the frontend to list users.

- [x] T001 Create `backend/Controllers/UsersController.cs` with `GET /api/users` endpoint.
- [x] T002 Implement logic to filter out the current user and return User DTOs.
- [x] T003 Ensure CORS and Authorization are correctly configured for the new controller.

---

## Phase 2: User Story 1 - Real User Listing (P1)

**Goal**: Sidebar displays real users from the database.

- [x] T004 Define `User` interface in `frontend/app/(dashboard)/components/ChatSidebar.tsx`.
- [x] T005 Implement `useEffect` to fetch users from `/api/users` using `ky`.
- [x] T006 Replace `MOCK_CHATS` mapping with the fetched `users` state.
- [x] T007 [P] Update `ChatCard` to use real user data (initials, avatar, name).

---

## Phase 3: User Story 2 - Live Status Updates (P1)

**Goal**: Sidebar reflects real-time status changes via SignalR.

- [x] T008 Update `PresenceProvider.tsx` to expose the SignalR `HubConnection` to other components (via context or ref).
- [x] T009 In `ChatSidebar.tsx`, subscribe to the `UserStatusChanged` event.
- [x] T010 Implement state update logic in `ChatSidebar.tsx` to find and update the user's status when the event fires.
- [x] T011 Verify that "Online", "Away", and "Offline" states correctly update the Avatar dot color.

---

## Phase 4: User Story 3 - Last Seen Display (P2)

**Goal**: Display relative time for offline users.

- [x] T012 Update `ChatCard` to calculate the relative "last seen" time from the `lastSeenAt` ISO string.
- [x] T013 Ensure the timestamp updates when a user goes offline.

---

## Phase 5: Polish & Verification

- [x] T014 Remove all remaining `MOCK_CHATS` code and unused imports.
- [x] T015 Verify the entire flow with two browser sessions.
- [x] T016 Run `project-strength-auditor` to confirm 100/100 Phase 2 completion.
