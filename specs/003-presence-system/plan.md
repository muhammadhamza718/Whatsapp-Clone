# Implementation Plan: Elite Presence & Profile System

**Branch**: `003-presence-system` | **Date**: 2026-04-24 | **Spec**: [spec.md](file:///f:/Courses/Hamza/WhatsApp%20Clone/specs/003-presence-system/spec.md)

## Summary
Complete overhaul of the Profile Modal to match the "Elite" Relay design. Transition from the Cloudinary Widget to a custom TypeScript `ky` upload implementation. Build a SignalR backend for real-time presence states and a frontend Auto-Away timer.

## Technical Context

**Primary Dependencies**: 
- Backend: `Microsoft.AspNetCore.SignalR`
- Frontend: `@microsoft/signalr`, `ky`, `framer-motion`
**Design Tokens**: Using Relay CSS variables from `globals.css`.

## Proposed Changes

### [NEW] [PresenceHub.cs](file:///f:/Courses/Hamza/WhatsApp%20Clone/backend/Hubs/PresenceHub.cs)
- Implement `OnConnectedAsync` and `OnDisconnectedAsync`.
- Broadcast status changes via `Clients.All.SendAsync("UserStatusChanged", userId, status)`.

### [MODIFY] [auth.ts](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/lib/auth.ts)
- Add custom fields `status` and `lastSeenAt` to the user object.

### [MODIFY] [ProfileModal.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/app/(dashboard)/components/ProfileModal.tsx)
- Rebuild layout into a 2-column grid.
- Implement the "Presence state" card on the right.
- Add the Auto-Away progress bar logic.

### [MODIFY] [AvatarUpload.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/app/(dashboard)/components/AvatarUpload.tsx)
- Remove `CldUploadWidget`.
- Add a hidden `<input type="file" />`.
- Implement `uploadToCloudinary` using TypeScript and `ky`.

### [NEW] [PresenceProvider.tsx](file:///f:/Courses/Hamza/WhatsApp%20Clone/frontend/lib/presence/PresenceProvider.tsx)
- Manage SignalR connection.
- Track user idle time (5-minute threshold).

---

## Verification Plan

### Automated Tests
- `npm run build`: Ensure no TypeScript errors in the new upload logic.

### Manual Verification
- **Silent Upload**: Confirm clicking upload opens the native file picker and shows a loader on the avatar.
- **2-Column Layout**: Verify the modal looks exactly like the `relay_phase2_presence_profile.html` design.
- **Presence Sync**: Open two browser tabs and verify status dots change in real-time.
- **Auto-Away**: Wait 5 minutes and confirm status changes to "Away".
