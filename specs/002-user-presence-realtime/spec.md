# Feature Specification: Phase 2 — User Profiles & Presence

**Feature Branch**: `002-user-presence-realtime`  
**Created**: 2026-04-26  
**Status**: Draft  

## 🧠 Architect's Vision
The presence system is the "heartbeat" of the Elite WhatsApp Clone. It must be invisible yet infallible. We are moving from a volatile broadcast-only model to a persistent, globally consistent state that handles the complexities of modern multi-tab browsing.

## User Scenarios & Testing

### User Story 1 - Real-time Status Heartbeat (Priority: P1)
As a user, I want to see my friends' status (Online/Away/Offline) change instantly in my sidebar so that I know exactly when they are available for chat.

**Why this priority**: Core value of real-time communication. Without this, the app feels "dead".

**Independent Test**: Open two different browser windows with two different users. Change User A's status and verify User B's sidebar updates within 500ms without page refresh.

**Acceptance Scenarios**:
1. **Given** User A is logged in, **When** they click "Away" in the profile modal, **Then** User B sees a yellow dot next to User A's name.
2. **Given** User A is "Online", **When** they close their browser tab, **Then** User B sees User A's status change to "Offline" within 10 seconds.

---

### User Story 2 - Auto-Away & Idle Logic (Priority: P2)
As a user, I want the app to automatically mark me as "Away" if I stop interacting with it, so my contacts don't think I'm ignoring them.

**Why this priority**: Reduces "false online" friction and improves user trust.

**Independent Test**: Set the app to a foreground tab and stop all keyboard/mouse movement. Verify status changes to "Away" after the 5-minute threshold.

---

### User Story 3 - Last Seen Transparency (Priority: P3)
As a user, I want to see exactly when someone was last online if they are currently offline, so I can gauge when they might return.

**Why this priority**: Standard "Elite" chat UX feature.

**Acceptance Scenarios**:
1. **Given** User A goes offline at 2:00 PM, **When** User B views User A's profile, **Then** it shows "Last seen: Today at 2:00 PM".

---

## Edge Cases & Risks

- **Risk: Multi-Device Ghosting**: User has two tabs open. Closing one should NOT mark them offline if the other is still active.
  - *Strategy*: Implement connection counting on the Hub.
- **Risk: Rapid Status Flapping**: User clicks Away/Online repeatedly.
  - *Strategy*: Implement server-side debouncing on status updates.
- **Risk: IPv6 Localhost Loop**: SignalR fails to negotiate on Windows due to `localhost` resolution.
  - *Mitigation*: Forced binding to `0.0.0.0` and `127.0.0.1` (BUG-001 fix).

## Requirements

### Functional Requirements
- **FR-001**: System MUST broadcast status changes to all connected clients via SignalR `PresenceHub`.
- **FR-002**: System MUST persist the `LastSeenAt` timestamp and current `Status` in the PostgreSQL database.
- **FR-003**: Frontend MUST detect user inactivity (no mouse/keyboard) and trigger "Away" status after 5 minutes.
- **FR-004**: System MUST handle multiple concurrent connections for a single user, only marking them "Offline" when the LAST connection drops.
- **FR-005**: Avatar component MUST display status dots (Green, Yellow, Gray) with accessible tooltips.

### Key Entities
- **User (Extended)**: 
  - `Status`: (enum: Online, Away, Offline)
  - `LastSeenAt`: (datetime)
  - `ConnectionCount`: (int, transient)

## Success Criteria
- **SC-001**: Presence broadcast latency < 300ms for 95th percentile of users.
- **SC-002**: Database status consistency: The DB MUST reflect the actual connectivity state within 5 seconds of a hard disconnect.
- **SC-003**: ZERO crashes due to SignalR state transitions (BUG-002 requirement).
- **SC-004**: High visual fidelity: Presence dots MUST use the Elite color palette defined in `globals.css`.
