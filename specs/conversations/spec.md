# Feature Specification: Conversations (DMs + Groups)

**Feature Branch**: `003-conversations-setup`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: Phase 3 Requirements from `realtime-chat-phases.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a 1-on-1 DM (Priority: P1)

As a user, I want to search for another user by their name or email and start a private conversation with them so that we can chat privately.

**Why this priority**: Core value of a messaging app. DMs are the primary interaction.

**Independent Test**: Search for "Aisha", click her profile, and see a new DM conversation appear in the sidebar and chat window.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I search for a user that I don't have a DM with, **Then** a new conversation should be created and show up in my sidebar.
2. **Given** I already have a DM with a user, **When** I search and select them again, **Then** the existing conversation should be opened instead of creating a new one.

---

### User Story 2 - Create and Manage Group Rooms (Priority: P2)

As a user, I want to create a named group, invite multiple members, and manage the group if I am an admin.

**Why this priority**: Essential for team and community collaboration.

**Independent Test**: Create a group named "Project X", add Zaid and Sara, and verify that all three see the group in their sidebars.

**Acceptance Scenarios**:

1. **Given** I am the creator of a group, **When** I rename the group or remove a member, **Then** the changes should be reflected for all members in real-time.
2. **Given** I am a regular member, **When** I try to remove another member, **Then** the system should prevent the action (Unauthorized).

---

### User Story 3 - Real-time Conversation List (Priority: P1)

As a user, I want my sidebar to update automatically when I receive a new message or am added to a new conversation.

**Why this priority**: Crucial for "Elite" real-time feel. Users shouldn't need to refresh to see new activity.

**Independent Test**: While on the dashboard, receive a message from Zaid and see his conversation move to the top of the list with an unread badge.

**Acceptance Scenarios**:

1. **Given** I have an open conversation list, **When** a new message arrives in any conversation, **Then** that conversation should move to the top of the list.
2. **Given** a new message in a non-active conversation, **When** it arrives, **Then** the unread count badge should increment.

---

### Edge Cases

- **Empty Search**: Searching with no query should show "No users found" or "Start typing to search".
- **Self-DM**: Preventing users from starting a DM with themselves (unless desired for "Notes to self").
- **Group Deletion**: What happens to the message history when a group is deleted? (Soft delete suggested).
- **Admin Removal**: If the last admin is removed or leaves, who becomes the next admin? (First joined member suggested).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support two conversation types: `DM` (1-on-1) and `Group` (Many-to-Many).
- **FR-002**: System MUST ensure DM uniqueness between any two users.
- **FR-003**: System MUST allow Group Admins to rename rooms, remove members, and delete rooms.
- **FR-004**: System MUST update the conversation list in real-time using SignalR.
- **FR-005**: System MUST track unread message counts per user/conversation.
- **FR-006**: System MUST persist conversation membership in the database.

### Key Entities

- **Conversation**: Represents a chat room. Attributes: `Id`, `Type`, `Name` (for groups), `CreatedAt`, `UpdatedAt`.
- **ConversationMember**: Junction table between User and Conversation. Attributes: `UserId`, `ConversationId`, `Role` (Admin/Member), `LastReadAt`.
- **User**: Existing entity. Relationships: Has many `ConversationMembers`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New conversation creation (DM or Group) completes in under 500ms.
- **SC-002**: Real-time sidebar re-sorting occurs within 100ms of a message event.
- **SC-003**: Unread counts are consistent across multiple browser tabs for the same user.
- **SC-004**: Zero duplicate DMs between the same two users.
