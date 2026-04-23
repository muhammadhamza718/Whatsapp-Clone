# Feature Spec: User Profile Editor

## Summary
Provide a user-friendly interface for users to update their profile information, specifically their display name and profile picture (avatar), as part of Phase 2 (User Profiles & Presence).

## Requirements

### 1. Profile Information
- **Display Name**: Users must be able to view and edit their display name.
- **Email Address**: Users must be able to view their email address (read-only).

### 2. Avatar Management
- **Avatar Upload**: Users can upload a new image from their device to be used as their profile picture.
- **Avatar Removal**: Users can remove their current profile picture, reverting to the initials fallback.
- **Initials Fallback**: If no avatar is uploaded, a deterministic colored circle with the user's initials must be displayed.

### 3. User Interface (Modal)
- The profile editor must appear as a modal/dialog over the chat interface.
- It must support both **Light** and **Dark** modes, consistent with the existing `relay` design system.
- It must include a blurred backdrop to maintain context while focusing on settings.

### 4. Technical Constraints
- **Storage**: Profile images must be stored on a CDN-backed cloud storage service (**Cloudinary**) for performance and scaling.
- **Auth Integration**: Profile updates must be synchronized with **Better Auth** using the `authClient.updateUser` method.
- **Validation**:
  - Image size limit: 2MB.
  - Allowed formats: JPEG, PNG, WebP.
  - Display name: 1-50 characters.

## Acceptance Criteria
- [ ] Clicking the user profile at the bottom of the sidebar opens the Profile Modal.
- [ ] Selecting a new image successfully uploads it to Cloudinary and updates the UI.
- [ ] Changing the display name and clicking "Save" updates the user's name in the database and UI.
- [ ] Removing the avatar successfully reverts the display to the initials fallback.
- [ ] The modal layout matches the approved mockup and works correctly in both themes.
