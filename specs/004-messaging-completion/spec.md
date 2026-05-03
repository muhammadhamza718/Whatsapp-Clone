# Feature Spec: 004-messaging-completion

## 🧠 Expert Architect Perspective
This specification completes the "heart" of the WhatsApp clone. We are moving from a static shell to a living, breathing real-time communication system. We prioritize sub-200ms message delivery, resilient typing indicators, and a buttery-smooth infinite scroll experience that doesn't lose the user's place.

## 📖 User Stories

### P1: Database & Foundation (The Base)
- **US-001**: As a developer, I want the database schema to reflect the messaging models so I can persist chat data reliably.
- **US-002**: As a user, I want to see my existing conversations in the sidebar as soon as I log in.

### P2: Core Messaging Loop (Phase 4)
- **US-003**: As a user, I want to send a message and see it appear instantly in my chat window (Right-aligned).
- **US-004**: As a user, I want to receive messages from others in real-time (Left-aligned) with a sound notification or visual cue.
- **US-005**: As a user, I want to see a typing indicator ("Hamza is typing...") when the person I'm chatting with is active in the input field.

### P3: Advanced UX (Infinite Scroll)
- **US-006**: As a user, I want to scroll up in a chat to load my previous message history without the scroll position jumping.

### P4: Conversation Management (Phase 3)
- **US-007**: As a user, I want to start a new DM by searching for a user's name/email.
- **US-008**: As a user, I want to create a group chat and invite multiple members.

## 🛠 Functional Requirements

- **FR-001 (Schema)**: Execute `dotnet ef database update` to sync `Conversations`, `ConversationMembers`, and `Messages`.
- **FR-002 (Messaging)**: Hub methods `SendMessage` MUST broadcast to the specific `ConversationId` group.
- **FR-003 (Typing)**: Hub methods `Typing(bool)` MUST broadcast to others in the group with a 3-second TTL (Time-To-Live).
- **FR-004 (Pagination)**: The `GetConversationMessages` endpoint MUST support skip/take cursor pagination.
- **FR-005 (Sidebar)**: The sidebar MUST update the "Latest Message" snippet and timestamp in real-time via SignalR.

## 🧪 Success Criteria (Measurable)
- **SC-001**: Message delivery latency < 300ms on a 4G connection.
- **SC-002**: Typing indicators MUST disappear within 5 seconds if no further "typing" events are received.
- **SC-003**: Infinite scroll MUST load 50 messages at a time and maintain current scroll offset.

## ⚠️ Risk Analysis
1. **Risk**: SignalR group name collisions. **Mitigation**: Use `Guid.ToString()` for group names.
2. **Risk**: Memory leaks in frontend listeners. **Mitigation**: Strict `connection.off()` in `useEffect` cleanup.
3. **Risk**: Race conditions in message ordering. **Mitigation**: Use server-side timestamps for primary sorting.
