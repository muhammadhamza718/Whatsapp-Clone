# Tasks: Elite Presence & Profile System

## Phase 1: Foundation & Backend
- [x] T001 Update Better Auth config (`frontend/lib/auth.ts`) with custom fields (`status`, `lastSeenAt`)
- [x] T002 Generate database migrations for the new user fields
- [x] T003 Create `PresenceHub.cs` in the ASP.NET Core backend
- [x] T004 Configure SignalR Hub in `Program.cs` and handle Authentication

## Phase 2: Silent Upload (Frontend)
- [x] T005 Refactor `AvatarUpload.tsx` to use a hidden file input
- [x] T006 Implement `uploadToCloudinary` function using TypeScript and `ky`
- [x] T007 Add inline loading spinner state to `Avatar.tsx`

## Phase 3: Elite Profile UI
- [x] T008 Rebuild `ProfileModal.tsx` into the 2-column grid layout
- [x] T009 Implement the "Presence state" card on the right column
- [x] T010 Style the modal exactly matching `relay_phase2_presence_profile.html`

## Phase 4: Real-time Presence
- [x] T011 Implement `PresenceProvider.tsx` with SignalR connection
- [x] T012 Implement idle detection logic (5-minute threshold)
- [x] T013 Implement the visual Auto-Away progress bar in `ProfileModal.tsx`
- [x] T014 Sync all presence dots across the Chat UI (`relay_chat_ui_light_dark.html`)

## Phase 5: Verification
- [x] T015 Verify Silent Upload works without third-party UI
- [x] T016 Verify multi-tab presence synchronization
- [x] T017 Verify "Last Seen" persistence on disconnect
