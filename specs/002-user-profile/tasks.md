# Tasks: 002-User Profile Editor

**Input**: Design documents from `specs/002-user-profile/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialization of Cloudinary and local environment

- [x] T001 [P] Configure Cloudinary credentials in `.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, etc.)
- [x] T002 Install Cloudinary dependencies in `frontend/package.json` (`next-cloudinary`)
- [x] T003 [P] Create Cloudinary configuration in `frontend/lib/cloudinary.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for Profile Management

- [x] T004 Create `frontend/components/ui/Avatar.tsx` (Shared avatar component with theme support)
- [x] T005 [P] Implement `InitialsAvatar` logic in `frontend/lib/utils.ts` (Deterministic color and initials generation)
- [x] T006 [P] Verify `authClient.updateUser` capability in `frontend/lib/auth-client.ts`

**Checkpoint**: Foundation ready - profile implementation can now begin

---

## Phase 3: User Story 1 - Profile & Avatar Editor (Priority: P1) 🎯 MVP

**Goal**: Implement the Profile Editor modal with Display Name editing and Avatar upload.

**Independent Test**: User opens the modal, uploads an image, changes their name, and clicks "Save". The UI updates immediately, and the data persists after refresh.

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `AvatarUpload` component in `frontend/app/(dashboard)/components/AvatarUpload.tsx` (Handles Cloudinary widget/upload)
- [x] T008 [P] [US1] Create `ProfileModal` component in `frontend/app/(dashboard)/components/ProfileModal.tsx` (Uses UI/UX from `relay_phase2_presence_profile.html`)
- [x] T009 [US1] Integrate `AvatarUpload` into `ProfileModal.tsx`
- [x] T010 [US1] Add form handling (react-hook-form) for "Display Name" field in `ProfileModal.tsx`
- [x] T011 [US1] Implement `handleSave` in `ProfileModal.tsx` to update Better Auth via `authClient.updateUser`
- [x] T012 [US1] Add "Remove Avatar" logic to revert to initials fallback
- [x] T013 [US1] Implement blurred backdrop and modal animations (Framer Motion)
- [x] T014 [US1] Add Light/Dark mode styling using Tailwind variables from `relay` theme

**Checkpoint**: User Story 1 complete - Profile editing is fully functional.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Refinement and validation

- [ ] T015 [P] Add loading states for image uploads and form submission
- [ ] T016 Add error handling for failed uploads or network issues
- [ ] T017 Final visual audit against `relay_phase2_presence_profile.html` mockup
- [ ] T018 [P] Update `docs/superpowers/specs/2026-04-23-user-profile-editor-design.md` with any implementation deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **Polish (Final Phase)**: Depends on User Story 1 completion

### Parallel Opportunities
- T001, T003, T005, T006 can all run in parallel.
- Once Phase 2 is done, T007 and T008 can start in parallel.
