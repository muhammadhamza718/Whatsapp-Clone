# Tasks: Conversations (Phase 3)

**Input**: Design documents from `/specs/conversations/`
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup & Foundational (Shared Infrastructure)

**Purpose**: Update DB schema and core models.

- [x] T001 Update `AppDbContext.cs` and create `Conversation` and `ConversationMember` models
- [x] T002 Add `ConversationId` to `ChatMessage` model and handle relations
- [x] T003 Create and apply EF Core Migration for Phase 3 schema
- [x] T004 Implement `IConversationRepository` and `IUnitOfWork` for atomic transactions
- [x] T005 Setup SignalR Hub with Redis Backplane and `IHubFilter` for secure group authorization

---

## Phase 2: User Story 1 - 1-on-1 DMs (Priority: P1) 🎯 MVP

**Goal**: Enable private messaging between two users.

- [x] T006 [P] Implement `ConversationService.GetOrCreateDMAsync` with idempotency logic
- [x] T007 Create `POST /api/conversations/dm` endpoint
- [x] T008 [P] Frontend: Create `NewDMModal` for user searching and DM initiation
- [x] T009 [P] Frontend: Update sidebar to render DM items with online status

---

## Phase 3: User Story 2 - Group Rooms (Priority: P2)

**Goal**: Collaborative group messaging with admin controls.

- [x] T010 [P] Implement `ConversationService.CreateGroupAsync`
- [x] T011 Create `POST /api/conversations/group` endpoint
- [x] T012 Implement `ManageMembers` and `UpdateGroupMetadata` logic with Admin role checks
- [x] T013 [P] Frontend: Create `CreateGroupModal` for group creation
- [x] T014 [P] Frontend: Create `GroupSettingsModal` for Admin actions

---

## Phase 4: User Story 3 - Real-time Sidebar (Priority: P1)

**Goal**: Instant updates for new messages and conversations.

- [x] T015 Implement `LastReadAt` logic in `ConversationMember` for unread counts
- [x] T016 Setup SignalR broadcast for `ConversationCreated` and `MessageReceived` (to update sidebar)
- [x] T017 [P] Frontend: Implement `ConversationList` real-time re-sorting logic
- [x] T018 [P] Frontend: Add unread badge counts to `ConversationItem`
- [x] T019 Unit tests for `ConversationService` (Idempotency and Admin roles)

---

## Phase 5: Polish & Validation

**Purpose**: Ensure "Elite" quality and stability.

- [ ] T020 Integration test for full DM flow (Search -> Create -> Send -> Sidebar update)
- [ ] T021 Manual UI Audit: Verify glassmorphism and theme consistency in sidebar
- [x] T022 Documentation: Update README with Phase 3 features

---

## Parallel Execution Strategy

- **Backend Foundation (T001-T005)**: Sequential.
- **DM & Group Features (T006-T014)**: Can run in parallel once T005 is complete.
- **Frontend Modals (T008, T013, T014)**: Can run in parallel with backend development.
