# Feature Spec: Elite Presence & Profile System

## Summary
Rebuild the User Profile Editor as an "Elite Modal" that matches the exact 2-column design from the Relay mockups. Replace the bulky Cloudinary widget with a "Silent Upload" experience (direct system file picker) and implement a SignalR-powered real-time presence system with Auto-Away logic.

## Requirements

### 1. Elite Profile Modal (UI/UX)
- **Layout**: Large centered modal with a 2-column grid.
    - **Left Column**: Profile settings (Avatar, Name, Email).
    - **Right Column**: Presence settings (Pills, Auto-Away timer, Hub status).
- **Styling**: Exact colors, borders, and spacing from `relay_phase2_presence_profile.html`.
- **Backdrop**: `backdrop-blur-[4px]` with `bg-black/40`.

### 2. Silent Avatar Upload
- **UX**: No third-party windows. Clicking "Upload" opens the native OS file picker.
- **Tech**: TypeScript + `ky` to POST directly to Cloudinary's unsigned upload API.
- **Feedback**: Inline loading spinner on the avatar during the upload.

### 3. Presence System (SignalR)
- **States**: Online, Away (Auto-Away), Offline (Last Seen).
- **Backend**: `PresenceHub` in ASP.NET Core to broadcast status changes to all clients.
- **Auto-Away**: 
    - Idle detection on frontend (mousemove/keydown).
    - 5-minute threshold.
    - Visual progress bar showing "X of 5 minutes idle" as per mockup.
- **Persistence**: Save `PresenceStatus` and `LastSeenAt` in the `user` table.

### 4. Chat Integration
- Update the main chat interface to match `relay_chat_ui_light_dark.html`.
- Presence indicators (dots) on all avatars in the sidebar and chat header.

## Acceptance Criteria
- [ ] Profile Modal opens as a large, 2-column grid.
- [ ] Avatar upload works silently without any Cloudinary-branded UI.
- [ ] Presence status updates in real-time across multiple browser tabs.
- [ ] User is marked as "Away" after 5 minutes of inactivity.
- [ ] "Last Seen" shows correctly for offline users.
- [ ] All colors and design tokens match the Relay CSS variables exactly.
