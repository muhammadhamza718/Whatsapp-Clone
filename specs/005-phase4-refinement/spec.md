# Spec: Phase 4 Refinement (Real-Time Polish)

## Goal
Improve the positioning and UX of Phase 4 features to meet "Elite" WhatsApp standards.

## Requirements
1. **Global Typing Indicators**:
   - The "typing..." status must appear in the **Chat List (Sidebar)** as well as the chat header.
   - The status should replace the `latestMessage` preview or appear below the conversation name.
   - It must be broadcasted via `PresenceHub` to all conversation members.
2. **Infinite Scroll Polish**:
   - Add a "Loading older messages..." spinner at the top of the chat window when fetching history.
   - Ensure the "Load more" trigger doesn't fire multiple times if a request is already in flight.
3. **Sidebar Interaction**:
   - Ensure the sidebar conversation card has a distinct "Typing" animation (subtle pulse or text color change).

## Technical Constraints
- Do not join every SignalR conversation group in the sidebar (performance cost).
- Use the existing `PresenceHub` user-groups for global notification delivery.
