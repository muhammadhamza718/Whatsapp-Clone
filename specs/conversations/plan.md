# Implementation Plan: Conversations (Phase 3)

**Branch**: `003-conversations-setup` | **Date**: 2026-04-28 | **Spec**: [specs/conversations/spec.md](file:///f:/Courses/Hamza/WhatsApp%20Clone/specs/conversations/spec.md)
**Input**: Feature specification from `specs/conversations/spec.md`

## Summary
Implement a robust, enterprise-grade conversation system supporting both private 1-on-1 DMs and multi-user Groups. The system will leverage EF Core 9 for persistence, .NET 9 SignalR with Redis Backplane for real-time scalability, and Next.js 15 for a high-performance sidebar using Optimistic UI.

## Technical Context

**Language/Version**: C# 9.0 (.NET 9), TypeScript (Next.js 15)  
**Primary Dependencies**: ASP.NET Core SignalR, Entity Framework Core 9, Better Auth, StackExchange.Redis  
**Storage**: PostgreSQL + Redis (Backplane)  
**Testing**: xUnit (Backend), Vitest (Frontend), Playwright (E2E)  
**Target Platform**: Docker / Multi-instance Cloud  
**Project Type**: Enterprise Real-time Web Application  
**Performance Goals**: <200ms p95 for API, <50ms for local UI updates  
**Constraints**: Zero-trust SignalR (Server-side validation), Atomic Transactions (UoW)  

## Constitution Check

- **Strong Foundations**: Every database write involving multiple entities MUST use the `IUnitOfWork` to ensure atomicity.
- **Zero-Trust**: SignalR Hubs MUST use `IHubFilter` to authorize group access against the DB before allowing connection joins.
- **Scalability**: SignalR MUST be configured with a Redis backplane to support multi-node deployments.
- **Simplicity**: Use explicit join table `ConversationMember` to allow for rich metadata (Role, LastReadAt).

## Project Structure

### Documentation (this feature)

```text
specs/conversations/
├── plan.md              # This file
├── research.md          # SignalR persistence research
├── data-model.md        # DB Schema details
├── quickstart.md        # Local setup for Phase 3
├── contracts/           # API DTOs and Endpoints
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
backend/
├── Models/
│   ├── Conversation.cs
│   ├── ConversationMember.cs
│   └── ChatMessage.cs (updated)
├── Data/
│   ├── AppDbContext.cs (updated)
│   └── IUnitOfWork.cs
├── Repositories/
│   ├── IConversationRepository.cs
│   └── ConversationRepository.cs
├── Services/
│   ├── IConversationService.cs
│   └── ConversationService.cs
└── Controllers/
    └── ConversationsController.cs

frontend/
├── app/
│   └── (dashboard)/
│       └── conversations/
│           └── page.tsx
├── components/
│   ├── sidebar/
│   │   ├── ConversationList.tsx
│   │   └── ConversationItem.tsx
│   └── modals/
│       ├── NewDMModal.tsx
│       └── CreateGroupModal.tsx
└── lib/
    └── signalr.ts
```

## Data Model Details (data-model.md preview)

- **`Conversation`**: `Guid Id`, `ConversationType Type`, `string? Name`, `DateTime CreatedAt`, `DateTime UpdatedAt`.
- **`ConversationMember`**: `Guid Id`, `Guid ConversationId`, `string UserId`, `ConversationRole Role`, `DateTime JoinedAt`, `DateTime LastReadAt`.

## API Contracts (contracts/ preview)

- `GET /api/conversations`: Returns user's conversation list with unread counts and latest message. Supports pagination.
- `POST /api/conversations/dm`: Body `{ targetUserId: string }`.
- `POST /api/conversations/group`: Body `{ name: string, memberIds: string[] }`.
- `PATCH /api/conversations/{id}`: Rename group.
- `DELETE /api/conversations/{id}/members/{userId}`: Remove member.
