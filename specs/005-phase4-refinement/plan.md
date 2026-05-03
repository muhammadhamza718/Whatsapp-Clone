# Plan: Phase 4 Refinement

## Proposed Changes

### [Component Name] Backend Hubs
#### [MODIFY] [ChatHub.cs](file:///f:/Courses/Hamza/WhatsApp%20Clone/backend/Hubs/ChatHub.cs)
- Update `SendTypingStatus` method.
- Fetch conversation members.
- Use `_presenceHubContext` to broadcast `UserTyping` to each member's personal group.

### [Component Name] Frontend Sidebar
#### [MODIFY] [ChatSidebar.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/app/(dashboard)/components/ChatSidebar.tsx)
- Add `typingUsers` state: `Map<string, Set<string>>` (convId -> userIds).
- Add listener for `UserTyping` on the presence connection.
- In `ConversationCard`, check if `typingUsers.get(conv.id)` has any entries.
- If so, display "typing..." instead of the latest message.

### [Component Name] Frontend Chat Window
#### [MODIFY] [ChatWindow.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/app/(dashboard)/components/ChatWindow.tsx)
- Add a loading spinner component at the top of the message list (above the sentinel).
- Show the spinner when `isFetchingMore` is true.

## Verification Plan

### Automated Tests
- Run `webapp-testing` with a Playwright script that:
  - Opens Tab A and Tab B.
  - Types in Tab A.
  - Verifies "typing..." appears in Tab B's Sidebar.

### Manual Verification
- Verify that clicking a "typing" conversation opens the chat correctly.
- Verify the spinner appears when scrolling up for history.
