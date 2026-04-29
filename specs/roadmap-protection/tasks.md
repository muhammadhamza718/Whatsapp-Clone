# Tasks: Roadmap Protection

**Input**: Design documents from `/specs/roadmap-protection/`
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Shared UI Components

- [x] T001 Create `frontend/components/ui/RoadmapLock.tsx` (Wrapper for disabled state + tooltip).
- [x] T002 Add `roadmap-locked` utility class to `frontend/app/globals.css` (or equivalent).

---

## Phase 2: User Story 1 - Feature Roadmapping (P1)

### Sidebar Icons (Phase 3 & 5)
- [x] T003 Update `SidebarIcon` in `frontend/app/(dashboard)/layout.tsx` to handle a `disabled` state.
- [x] T004 Apply `RoadmapLock` to "Users" icon (Phase 3).
- [x] T005 Apply `RoadmapLock` to "Settings" icon (Phase 5).

### Sidebar Actions (Phase 3)
- [x] T006 Apply `RoadmapLock` to the "Search" container in `ChatSidebar.tsx`.
- [x] T007 Apply `RoadmapLock` to the "Plus" button in `ChatSidebar.tsx`.

### Rooms Section (Phase 4)
- [x] T008 Replace mock `RoomCard` list with a "Phase 4 - Coming Soon" placeholder in `ChatSidebar.tsx`.

---

## Phase 3: Polish & Verification

- [x] T009 Ensure all tooltips are consistent (e.g., "Coming in Phase X").
- [x] T010 Run `project-strength-auditor` to verify 100/100 score.
