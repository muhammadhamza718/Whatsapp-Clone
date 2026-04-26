---
id: BUG-001
title: "SignalR Failed to Fetch on localhost"
category: networking
status: resolved
reported_at: 2026-04-26T00:07:00Z
resolved_at: 2026-04-26T14:42:00Z
tags: [signalr, cors, localhost, ipv4, ipv6, dotnet, kestrel, presence]
---

# 🐛 BUG-001: SignalR "Failed to Fetch" on localhost

## 📋 Summary
The browser threw `TypeError: Failed to fetch` during SignalR negotiation, preventing the Presence system from ever establishing a real-time connection — meaning online/offline status indicators never worked.

---

## 🏗️ System Context
> How this part of the system works — for interviewers and future agents.

### Architecture Involved
- **Frontend**: `frontend/lib/presence/PresenceProvider.tsx`
- **Backend**: `backend/Hubs/PresenceHub.cs`, `backend/Program.cs`
- **Infrastructure**: ASP.NET Core 9.0 + Kestrel, Docker PostgreSQL

### How This Part of the System Works
The Presence system tracks whether a user is Online, Away, or Offline in real-time.

**Frontend flow:**
1. `PresenceProvider` is a React context that wraps the entire dashboard.
2. On mount, it reads `NEXT_PUBLIC_API_URL` from `.env` (e.g., `http://localhost:5100/api`).
3. It strips `/api` to derive the base URL: `http://localhost:5100`.
4. It builds a SignalR `HubConnectionBuilder` targeting `http://localhost:5100/hubs/presence?userId=<id>`.
5. It calls `.start()` which first sends an HTTP `POST` to `/hubs/presence/negotiate` to agree on a transport (WebSockets, SSE, or LongPolling).
6. After negotiation succeeds, it upgrades to a WebSocket.

**Backend flow:**
1. `Program.cs` registers SignalR with `builder.Services.AddSignalR()`.
2. A CORS policy (`AllowVercel`) is registered allowing `http://localhost:3000` with `AllowCredentials()`.
3. The app runs with `app.Run($"http://0.0.0.0:{port}")` — binding Kestrel to **IPv4 only**.
4. `app.MapHub<PresenceHub>("/hubs/presence")` registers the hub endpoint.
5. `PresenceHub` handles `OnConnectedAsync`, `OnDisconnectedAsync`, and `UpdateStatus`.

---

## 🚨 The Error

### What Happened
After logging in, the browser console immediately showed SignalR negotiation failures. The `PresenceProvider` never transitioned to `isConnected: true`. Presence indicators stayed disconnected.

### Error Message / Stack Trace
```
[browser] Warning: Error from HTTP request. TypeError: Failed to fetch.
[browser] Error: Failed to complete negotiation with the server: TypeError: Failed to fetch
    at ConsoleLogger.log (node_modules_@microsoft_signalr_dist_esm_0mql2u_._.js:493:30)
    at HttpConnection._getNegotiationResponse (... :1674:26)
    at async HttpConnection._startInternal (... :1587:41)
    at async HttpConnection.start (... :1496:9)
    at async HubConnection._startInternal (... :2456:9)
    at async HubConnection._startWithStateTransitions (... :2434:13)

[browser] SignalR Connection Error: Error: Failed to complete negotiation with the server:
TypeError: Failed to fetch
```

### Steps to Reproduce
1. Start Docker: `docker-compose up -d`
2. Start Backend: `cd backend && dotnet watch run`
3. Start Frontend: `cd frontend && npm run dev`
4. Log in with any account
5. Navigate to the dashboard
6. Open DevTools → Console — SignalR error appears immediately

### Environment
- **OS**: Windows 11
- **Browser**: Chrome (Chromium-based)
- **Frontend**: Next.js 15 on `http://localhost:3000`
- **Backend**: ASP.NET Core 9.0 on `http://localhost:5100`
- **Docker**: PostgreSQL 18

---

## 🔍 Investigation Log

### Phase 1: Root Cause Investigation

#### Step 1 — URL Verification
Traced the URL construction end-to-end:
- `.env`: `NEXT_PUBLIC_API_URL=http://localhost:5100/api`
- `PresenceProvider.tsx` line 34: `baseUrl = NEXT_PUBLIC_API_URL.replace("/api", "")` → `http://localhost:5100`
- Hub URL sent to SignalR: `http://localhost:5100/hubs/presence?userId=...`
- Backend mapping: `app.MapHub<PresenceHub>("/hubs/presence")`
- **Result**: ✅ URLs match perfectly — not a URL misconfiguration issue.

#### Step 2 — CORS Policy Analysis
Inspected `Program.cs`:
```csharp
policy.WithOrigins("https://whatsapp-clone-relay.vercel.app", "http://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```
- ✅ `http://localhost:3000` is explicitly listed — not a wildcard issue.
- ✅ `AllowCredentials()` is present (required by SignalR).
- ✅ `app.UseCors("AllowVercel")` is called **before** `app.MapHub` — correct order.

#### Step 3 — Verified Backend is Listening
```powershell
netstat -ano | findstr :5100
# Output: TCP  0.0.0.0:5100  0.0.0.0:0  LISTENING  4408
```
- ✅ Backend IS running on port 5100. PID 4408 confirmed.

#### Step 4 — Diagnostic: Test Negotiation via CLI
```bash
# Test 1: Plain IPv4 curl
curl.exe -v -X POST "http://127.0.0.1:5100/hubs/presence/negotiate?negotiateVersion=1"
# Result: ✅ HTTP 200 — returns {"connectionId":"H8Qq1...", "availableTransports":[...]}

# Test 2: With Origin header (simulates browser CORS preflight)
curl.exe -v -X POST "http://localhost:5100/hubs/presence/negotiate?negotiateVersion=1" \
  -H "Origin: http://localhost:3000"
# Result: ✅ HTTP 200 — response includes:
#   Access-Control-Allow-Credentials: true
#   Access-Control-Allow-Origin: http://localhost:3000

# Test 3: IPv6 loopback (what the browser actually uses!)
curl.exe -v -X POST "http://[::1]:5100/hubs/presence/negotiate?negotiateVersion=1"
# Result: ❌ Connection refused after 2221ms — server not listening on ::1
```

#### Evidence Summary
| Check | Result |
|-------|--------|
| Backend is running on 5100 | ✅ Confirmed |
| CORS policy allows localhost:3000 | ✅ Confirmed |
| Hub endpoint mapped correctly | ✅ Confirmed |
| IPv4 curl succeeds (127.0.0.1) | ✅ Confirmed |
| CORS headers in response | ✅ Confirmed |
| IPv6 curl succeeds (::1) | ❌ **Connection refused** |

### Phase 2: Pattern Analysis

**Key insight from `netstat`**: Only `0.0.0.0:5100` was listed — no `[::]:5100` entry.  
This means Kestrel is **only listening on IPv4**.

**Browser behavior on Windows**: Modern Chromium browsers follow RFC 6724, which gives preference to IPv6 addresses. When a browser resolves `localhost`, it first tries `::1` (IPv6 loopback). If the server doesn't have a socket listening on `::1`, the connection is refused before it even reaches the CORS middleware — hence `TypeError: Failed to fetch` with no HTTP response at all.

**Root cause confirmed**: `app.Run("http://0.0.0.0:{port}")` in `Program.cs` only opens an IPv4 socket. The browser's IPv6 connection attempt hits nothing.

### Phase 3: Hypothesis & Fix

**Hypothesis**: "The SignalR connection fails because the browser resolves `localhost` to `::1` (IPv6) but the backend only binds to `0.0.0.0` (IPv4). Fix requires either making the server listen on IPv6 too, or forcing the client to use IPv4 explicitly."

**Two minimal changes identified:**
1. Backend: `http://0.0.0.0:{port}` → `http://*:{port}` (listens on all interfaces including IPv6)
2. Frontend `.env`: `localhost` → `127.0.0.1` (forces IPv4, bypassing DNS resolution entirely)

Both applied simultaneously for belt-and-suspenders reliability.

---

## 🔧 Fix Attempts

### Attempt #1
- **Date**: 2026-04-26
- **Hypothesis**: Browser uses IPv6 for `localhost`; Kestrel only bound to IPv4
- **Changes Made**:

  **`backend/Program.cs`** (line 78):
  ```diff
  -app.Run($"http://0.0.0.0:{port}");
  +app.Run($"http://*:{port}");
  ```

  **`frontend/.env`** (line 4):
  ```diff
  -NEXT_PUBLIC_API_URL=http://localhost:5100/api
  +NEXT_PUBLIC_API_URL=http://127.0.0.1:5100/api
  ```

- **Verification run**: IPv6 `curl` was attempted **after** the backend change but **before** the backend had restarted from `dotnet watch run`. The `netstat` still showed only `0.0.0.0:5100`, confirming the old process was still active. The `.env` change handles this by bypassing DNS entirely.

- **Result**: 🟠 Fix applied — awaiting user verification
- **User Verdict**: ⏳ Pending

---

## ✅ Resolution

> **Status**: 🟢 Resolved

### Confirmed Fix
The user confirmed the fix works. The "Connected" status is now green and stable.
The resolution involved:
1.  **Server-side**: Changing the Kestrel binding to `*` to support dual-stack (IPv4/IPv6).
2.  **Client-side**: Forcing `127.0.0.1` in the `.env` to bypass ambiguous browser DNS resolution.

### Root Cause (Final Verdict)
IPv4/IPv6 localhost resolution mismatch. Windows Chromium browsers prioritize `::1` (IPv6) for `localhost`. Since Kestrel was only bound to `0.0.0.0` (IPv4), the connection was refused at the network layer.

### What We Learned
On Windows, `localhost` resolution is non-deterministic between IPv4 and IPv6. Explicitly using `127.0.0.1` in development environments prevents "Failed to fetch" errors caused by server-client protocol mismatches.

### Files Changed
| File | Change |
|------|--------|
| `backend/Program.cs` | Kestrel binding: `http://0.0.0.0:{port}` → `http://*:{port}` |
| `frontend/.env` | API URL: `http://localhost:5100/api` → `http://127.0.0.1:5100/api` |

---

## 🎓 Interview Notes

**Question**: "Tell me about a networking bug you debugged."

**Answer**:
"I encountered a SignalR negotiation failure (`TypeError: Failed to fetch`) where the backend was correctly configured with CORS and listening on the expected port. By testing with `curl` against both `127.0.0.1` and `[::1]`, I found the server only responded to IPv4. Modern browsers on Windows prefer IPv6 for `localhost`, so they were attempting to connect to `::1` and failing. I fixed it by enabling dual-stack listening on the server and explicitly using `127.0.0.1` on the client to ensure reliable IPv4 connectivity."
