# Implementation Plan: User Profile Editor

**Branch**: `002-user-profile` | **Date**: 2026-04-23 | **Spec**: [spec.md](file:///f:/Courses/Hamza/WhatsApp%20Clone/specs/002-user-profile/spec.md)
**Input**: Feature specification for Phase 2, Step 1: User profile (display name + avatar upload).

## Summary
Implement a Profile Editor modal in the Next.js frontend that allows users to change their display name and upload an avatar to Cloudinary. This plan focuses on the client-side integration with Better Auth and Cloudinary storage, using the exact UI/UX design from [relay_phase2_presence_profile.html](file:///f:/Courses/Hamza/WhatsApp%20Clone/relay_phase2_presence_profile.html) (Profile settings section).

## Technical Context

**Language/Version**: TypeScript / Next.js (App Router)
**Primary Dependencies**: Better Auth (@better-auth/client), Cloudinary (next-cloudinary or Upload Widget)
**Storage**: Cloudinary (Binary storage) + PostgreSQL (Better Auth `user` table for metadata)
**Testing**: Vitest (Unit) + Playwright (E2E)
**Target Platform**: Web (Responsive)
**Project Type**: Web Application
**Performance Goals**: < 2s upload/transform time, < 100ms UI update after save.
**Constraints**: 2MB file limit, Better Auth schema compatibility.
**Scale/Scope**: Designed for millions of avatars via Cloudinary CDN.
**UI/UX Reference**: [relay_phase2_presence_profile.html](file:///f:/Courses/Hamza/WhatsApp%20Clone/relay_phase2_presence_profile.html) (Modal version)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Smallest viable change: Focuses only on Step 1.
- [x] No hardcoded secrets: Use `.env` for Cloudinary keys.
- [x] Test-first: Define test cases before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-profile/
├── plan.md              # This file
├── spec.md              # Feature requirements
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
frontend/
├── app/
│   └── (dashboard)/
│       └── components/
│           ├── ProfileModal.tsx    # Main modal component
│           └── AvatarUpload.tsx   # Cloudinary integration
├── lib/
│   ├── auth-client.ts           # Better Auth client
│   └── cloudinary.ts            # Cloudinary config
└── components/
    └── ui/                      # Shared UI components
```

**Structure Decision**: Integrated into the existing Next.js `frontend` app using standard React component patterns.

## Implementation Phases

### Phase 1: Environment & Setup
1. Configure Cloudinary account and get API keys.
2. Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env`.
3. Install `next-cloudinary` or setup the Upload Widget.

### Phase 2: Core Components
1. **InitialsAvatar**: Logic for deterministic colors and initials extraction.
2. **AvatarUpload**: Component for file selection, Cloudinary upload, and preview.
3. **ProfileModal**: The wrapper modal using the approved mockup design.

### Phase 3: Auth Integration
1. Implement `handleSave` to call `authClient.updateUser`.
2. Ensure local state synchronization after the update.

## Evaluation and Validation
- **Unit Tests**: Test initials extraction and color generation logic.
- **Integration Tests**: Verify Cloudinary upload returns a valid URL.
- **Manual Verification**: Visual check of the modal in Light/Dark modes against the mockup.
