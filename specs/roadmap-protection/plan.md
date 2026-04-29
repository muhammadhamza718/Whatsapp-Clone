# Implementation Plan: Roadmap Protection

**Branch**: `roadmap-protection` | **Date**: 2026-04-27 | **Spec**: `/specs/roadmap-protection/spec.md`
**Input**: Feature specification from `/specs/roadmap-protection/spec.md`

## Summary
Add visual "Disabled/Coming Soon" states to all UI elements that are planned for future phases. This includes the Search bar, Plus button, Rooms section, and Sidebar icons. We will implement a reusable "RoadmapTooltip" or update existing components to handle "Phase-Locked" states.

## Technical Context

**Language/Version**: TypeScript (Next.js 15)
**Primary Dependencies**: Lucide-React, Tailwind CSS
**Project Type**: Frontend Polish

## Technical Approach

### 1. Style Utilities
- Define a `roadmap-locked` CSS utility class in `index.css` that applies `opacity-50`, `grayscale`, and `cursor-not-allowed`.

### 2. Component Updates
- **Avatar / Icons**: Update the `SidebarIcon` in `layout.tsx` to accept a `phase` prop. If `phase > 2`, apply the locked style and a tooltip.
- **Search/Plus**: Update `ChatSidebar.tsx` to wrap these in a tooltip and apply locked styles.
- **Rooms**: Replace the hardcoded `RoomCard` list in `ChatSidebar.tsx` with a single "Phase 4: Groups & Rooms Coming Soon" banner.

### 3. Tooltip Implementation
- Use a simple CSS-based tooltip or a basic React component to avoid adding heavy dependencies like Radix/Shadcn for this minor polish.

## Project Structure

```text
frontend/
├── components/ui/
│   └── RoadmapLock.tsx      # [NEW] Wrapper for locked features
└── app/(dashboard)/
    ├── layout.tsx           # [MODIFY] Lock Settings/Users icons
    └── components/
        └── ChatSidebar.tsx  # [MODIFY] Lock Search/Plus/Rooms
```
