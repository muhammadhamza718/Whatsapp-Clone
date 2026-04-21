# Real-Time Chat App — Build Phases

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | ASP.NET Core Web API + SignalR |
| Database | PostgreSQL + EF Core |
| Containerization | Docker + Docker Compose |
| Deployment | Fly.io |

---

## Phase 0 — Project Setup & Environment

> Foundation — get everything wired before writing a single feature.

- Git repo init + folder structure (frontend/, backend/, docker/)
- Docker Compose setup (frontend, backend, DB containers)
- ASP.NET Core project scaffolding (Web API template)
- Next.js (App Router) + TypeScript + Tailwind CSS setup
- PostgreSQL container + EF Core configuration
- Environment config (.env / appsettings.json / appsettings.Development.json)
- Initial DB migration
- README with local setup instructions

**Key tools:** Docker Compose, EF Core Migrations, Next.js, appsettings.json

---

## Phase 1 — Authentication System (Better-Auth)

> Security — Managed identity with Better-Auth + Ky for secure requests.

- Register with email + password (Better-Auth core)
- Social Login support (Google/GitHub)
- Session management & multi-device login
- Secure cookie-based authentication
- Password hashing & security best-practices (Automatic)
- Protected API routes (Middleware)
- Frontend Auth Client (@better-auth/client)
- Modern Login and Register UI pages (Tailwind + Framer Motion)

**Key tools:** Better-Auth, Ky, PostgreSQL, Framer Motion

---

## Phase 2 — User Profiles & Presence

> Real-time — first use of SignalR for live presence broadcasting.

- User profile (display name + avatar upload)
- Initials fallback avatar
- Three presence states: Online / Away / Offline
- Auto-Away after 5 minutes of inactivity
- Set to Offline on SignalR disconnect
- Last seen timestamp (shown when Offline)
- SignalR presence hub — broadcast status changes to all connected clients
- Presence indicator UI component (green / yellow / gray dot)

**Key tools:** SignalR Hub, @microsoft/signalr, OnConnected / OnDisconnected lifecycle

---

## Phase 3 — Conversations (DMs + Groups)

> Core feature — data model and UI for all conversation types.

- Start a 1-on-1 DM by searching a user
- Create a named group room
- Invite members to a group
- Group admin: rename room, remove members, delete room
- Conversation list sidebar
- Sort conversations by latest message
- Unread count badge per conversation
- Conversation REST API + DB schema (Conversations, ConversationMembers tables)

**Key tools:** REST API, EF Core relations, Repository pattern

---

## Phase 4 — Core Real-Time Messaging

> SignalR — the main chat loop. This is the heart of the project.

- Send and receive messages via SignalR hub
- Persist messages to PostgreSQL
- Message history with cursor-based pagination
- Typing indicator ("Hamza is typing...")
- Scroll-to-bottom on new message
- Message bubble UI (sent vs received alignment)
- Timestamp display on each message
- Infinite scroll / load older messages on scroll up
- SignalR hub groups scoped per conversation

**Key tools:** SignalR Groups, Hub methods, Cursor pagination

---

## Phase 5 — Message Actions

> UX — edit, delete, react, and reply to messages.

- Edit message → broadcasts update, shows "(edited)" label with timestamp
- Delete message (soft delete) → shows "This message was deleted"
- Emoji reactions (toggle on / off per user)
- Reaction counts per emoji type
- Reply to message (quoted bubble above reply)
- Real-time broadcast of edits, deletes, and reactions via SignalR
- Hover action toolbar on each message
- Emoji picker component

**Key tools:** SignalR broadcast, Soft delete pattern, emoji-mart

---

## Phase 6 — Read Receipts & Status

> Real-time — per-user delivery and read tracking.

- Sent → single tick
- Delivered → double tick
- Read → blue double tick
- Per-user read tracking in group conversations
- Unread count updates in sidebar on new message
- Mark conversation as read when opened
- SignalR broadcast of read events to sender
- MessageReadStatus table (MessageId, UserId, ReadAt)

**Key tools:** MessageReadStatus DB table, SignalR events, Intersection Observer API

---

## Phase 7 — File Uploads & Link Previews

> Media — images, file attachments, and auto link previews.

- Image upload with inline preview in chat
- File attachments (PDF, docs) with download link
- Files stored on server via Docker volume
- Static file serving endpoint
- Link preview: auto-fetch Open Graph metadata (title, image, description)
- Preview card rendered below message
- File size and type validation (backend + frontend)
- Upload progress indicator in the input bar

**Key tools:** IFormFile (ASP.NET), HtmlAgilityPack (OG scraper), Docker volume

---

## Phase 8 — Notifications & Search

> Final features — surface new messages and find old ones.

**Notifications**
- In-app notification bell with unread list
- Browser push notifications via Web Push API (when tab is not focused)
- @mention alerts — always notify even if conversation is muted
- Mute / unmute a conversation

**Search**
- Global message search across all joined conversations
- Results show: message snippet + conversation name + timestamp
- Click a result → open conversation and jump to that message in context
- Scroll anchor + highlight on message jump

**Key tools:** Web Push API, VAPID keys, PostgreSQL ILIKE / Full-Text Search, Scroll anchor

---

## Phase 9 — Deployment

> Ship it — production-ready Docker build on Fly.io.

- Production Dockerfiles (multi-stage builds for frontend + backend)
- Fly.io app config (fly.toml)
- Fly Postgres managed database
- Secrets and env vars configured on Fly
- GitHub Actions CI/CD pipeline (build → test → deploy)
- Health check endpoint (/health)
- HTTPS + custom domain setup
- Final README update + demo video / screenshots

**Key tools:** Fly.io, Docker multi-stage, GitHub Actions, fly.toml

---

## Phase Summary

| Phase | Focus | Category |
|---|---|---|
| 0 | Project setup, Docker, DB | Foundation |
| 1 | Better-Auth, Ky, Secure Identity | Security |
| 2 | Profiles, presence, SignalR intro | Real-time |
| 3 | DMs, group rooms, conversation list | Core feature |
| 4 | Send/receive messages, typing, history | SignalR |
| 5 | Edit, delete, reactions, reply | UX |
| 6 | Read receipts, unread counts | Real-time |
| 7 | Images, file uploads, link previews | Media |
| 8 | Notifications, @mentions, search | Final features |
| 9 | Docker builds, Fly.io, CI/CD | Deployment |
