# Technical Plan: 004-messaging-completion

## 🏗️ Architecture Design

We leverage the existing SignalR `ChatHub` and `ConversationsController`. The heavy lifting involves state synchronization between the Sidebar (Summary View) and the ChatWindow (Detailed View).

### Data Model Verification
We will ensure the following relationships are active in EF Core:
- `User` -> Many `ConversationMember`
- `Conversation` -> Many `ConversationMember`
- `Conversation` -> Many `ChatMessage`
- `ChatMessage` -> Belongs to `Sender` (User)

### SignalR Contracts
- **Hub -> Client**:
  - `ReceiveMessage(object message)`: Broadcasts a new message.
  - `UserTyping(string userId, bool isTyping)`: Broadcasts typing status.
- **Client -> Hub**:
  - `JoinConversation(Guid id)`: Joins the group for real-time updates.
  - `SendMessage(Guid id, string content)`: Persists and broadcasts.
  - `SendTypingStatus(Guid id, bool isTyping)`: Broadcasts current typing state.

## 🛠 Phase 0: Deep Research & Environment
- **Task**: Verify `dotnet ef migrations list` to see if `003-messaging-tables` or similar is pending.
- **Task**: Verify `NEXT_PUBLIC_API_URL` is correctly mapped for SignalR Hubs in production (Railway).

## 🛠 Phase 1: Backend Implementation (The Logic)
### `Hubs/ChatHub.cs`
- [ ] Implement `SendTypingStatus(Guid conversationId, bool isTyping)`.
- [ ] Update `SendMessage` to trigger a `MessageReceived` event on the `PresenceHub` (via User groups) so recipients' Sidebars update even if they aren't in the active chat.

### `Controllers/ConversationsController.cs`
- [ ] Audit `GetConversationMessages` for correct timestamp sorting (DESC).

## 🛠 Phase 2: Frontend Core (The Messaging)
### `lib/presence/PresenceProvider.tsx`
- [ ] Ensure the SignalR connection is stable and exposes the `connection` object for use in Chat components.

### `app/(dashboard)/components/ChatWindow.tsx`
- [ ] **Typing Indicator**: 
  - Add state `typingUsers: string[]`.
  - Listen for `UserTyping` event.
  - Add `onKeyDown` handler with `lodash.debounce` (or native throttle) to send `isTyping: true`.
- [ ] **Message Rendering**: 
  - Group consecutive messages from the same sender to reduce visual clutter.
  - Fix timestamp formatting to match "Elite" UI standards (Subtle, bottom-right).

## 🛠 Phase 3: Infinite Scroll (Advanced UX)
### `app/(dashboard)/components/ChatWindow.tsx`
- [ ] Implement `useIntersectionObserver` hook.
- [ ] Add a "Sentinel" div at the top of the message list.
- [ ] When Sentinel is visible:
  - Fetch 50 older messages using `skip = currentMessageCount`.
  - Save `scrollHeight` before state update.
  - Apply scroll compensation after state update to prevent "jumping".

## 🛠 Phase 4: Modal & Sidebar Integration
- [ ] **New DM**: Verify `NewDMModal` successfully calls `POST /api/conversations/dm`.
- [ ] **Group Creation**: Verify `CreateGroupModal` successfully calls `POST /api/conversations/group`.

## ⚠️ Risk & Mitigation
- **Risk**: Double messages on slow networks. **Mitigation**: Client-side optimistic IDs or server-side deduplication (using ClientId).
- **Risk**: High CPU usage from frequent typing events. **Mitigation**: 2-second debounce on the frontend.
