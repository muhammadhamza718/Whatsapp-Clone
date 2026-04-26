# Feature Specification: Real-Time Presence Integration (Sidebar)

**Feature Branch**: `presence-sidebar-integration`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Fix TST-P2-004: Real-time broadcast visibility is limited by Mock Data in the sidebar. Transition from mock data to real database users with SignalR status updates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real User Listing (Priority: P1)

As a user, I want to see real users from the database in my sidebar instead of mock data, so that I can see who is actually available to chat.

**Why this priority**: Essential for moving beyond MVP/Mock state. It is the foundation for all real-time interactions.

**Independent Test**: Can be fully tested by logging in and verifying that the sidebar displays other registered users from the database.

**Acceptance Scenarios**:

1. **Given** there are other users in the database, **When** I log in to the dashboard, **Then** I should see their names and avatars in the "Direct messages" section of the sidebar.
2. **Given** a user has no avatar, **When** they appear in my sidebar, **Then** I should see their initials as a fallback.

---

### User Story 2 - Live Status Updates (Priority: P1)

As a user, I want to see the real-time status (Online/Away/Offline) of other users in my sidebar, so that I know who I can message right now.

**Why this priority**: Core requirement of Phase 2 and the "Elite" real-time promise.

**Independent Test**: Can be tested by opening two different browsers with two different users and changing the status of one while watching the other's sidebar.

**Acceptance Scenarios**:

1. **Given** User A is viewing the sidebar, **When** User B logs in, **Then** User B's indicator in User A's sidebar should turn green (Online).
2. **Given** User B is online, **When** User B's status changes to "Away" (due to inactivity), **Then** their indicator in User A's sidebar should turn yellow.
3. **Given** User B is online, **When** User B's closes their browser, **Then** their indicator in User A's sidebar should turn gray (Offline).

---

### User Story 3 - Last Seen Display (Priority: P2)

As a user, I want to see when a user was last online if they are currently offline, so that I have context on their recent activity.

**Why this priority**: Standard chat app feature that provides useful context.

**Independent Test**: Can be tested by looking at an offline user in the sidebar and verifying the relative time (e.g., "5m ago") matches their `lastSeenAt` timestamp.

**Acceptance Scenarios**:

1. **Given** User B is offline, **When** I view their card in the sidebar, **Then** I should see their last seen time (e.g., "2h", "5m") displayed.

---

## Edge Cases

- **No Users found**: System should display a friendly "No users found" or empty state in the sidebar.
- **SignalR Reconnection**: If the SignalR connection drops and reconnects, the sidebar status should resynchronize.
- **Large User Count**: For now, we will fetch all users, but the system should be ready for pagination/filtering in Phase 3.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend MUST provide an endpoint `GET /api/users` that returns a list of users (excluding the current user).
- **FR-002**: Frontend MUST fetch users from `GET /api/users` and display them in `ChatSidebar.tsx`.
- **FR-003**: `ChatSidebar.tsx` MUST subscribe to the `UserStatusChanged` SignalR event.
- **FR-004**: System MUST update the local state of users in the sidebar when a `UserStatusChanged` event is received.
- **FR-005**: Avatars in the sidebar MUST show the correct status dot color based on the real-time status.

### Key Entities

- **User**: Represents a registered account with `id`, `name`, `email`, `image`, `status`, and `lastseenat`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sidebar transitions from 100% Mock Data to 100% Real Data.
- **SC-002**: Status changes are reflected in the UI within <500ms of the SignalR event being received.
- **SC-003**: Zero "Failed to fetch" errors for user listing in production-like environments.
