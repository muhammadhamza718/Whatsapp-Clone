---
id: BUG-002
title: "SignalR Cannot Send Data - Connection Not in Connected State"
category: frontend
status: resolved
reported_at: 2026-04-26T22:38:00Z
resolved_at: 2026-04-26T14:42:00Z
tags: [signalr, presence, react, useref, reconnect, hubconnectionstate, race-condition]
---

# 🐛 BUG-002: SignalR "Cannot Send Data - Connection Not in Connected State"

## 📋 Summary
After the BUG-001 IPv4 fix allowed SignalR to connect, a second error surfaced: every time the user moved their mouse or performed any activity during a SignalR reconnection window, the app tried to send status updates through a disconnected hub — crashing with "Cannot send data if the connection is not in the 'Connected' State."

---

## 🏗️ System Context

### Architecture Involved
- **Frontend**: `frontend/lib/presence/PresenceProvider.tsx`
- **Backend**: `backend/Hubs/PresenceHub.cs`

### How This Part of the System Works
`PresenceProvider` manages two independent `useEffect` hooks:

**Hook 1 — SignalR Connection Lifecycle:**
- Creates a `HubConnection` via `HubConnectionBuilder`
- Calls `connection.start()` → sets `connectionRef.current` and `isConnected = true` on success
- Registers `onreconnecting` → sets `isConnected = false`
- Registers `onreconnected` → sets `isConnected = true`
- `withAutomaticReconnect()` handles temporary disconnections

**Hook 2 — Idle Detection:**
- Attaches `mousemove`, `keydown`, `click`, `scroll` event listeners
- On any activity: calls `updateStatus("online")` if user was idle
- On a 10-second interval: checks how long since last activity, calls `updateStatus("away")` if idle too long

**`updateStatus` function:**
- Sets local `status` state
- If `connectionRef.current` is non-null AND `session.user.id` exists, invokes `UpdateStatus` on the hub

---

## 🚨 The Error

### What Happened
After BUG-001 was fixed (SignalR could negotiate successfully), two new errors appeared:

1. Repeatedly in browser console: `Connection disconnected with error 'Error: Server returned an error on close: Connection closed with an error.'`
2. Immediately after any mouse movement: `Cannot send data if the connection is not in the 'Connected' State.`

### Error Message / Stack Trace
```
[browser] Failed to update status via SignalR Error: Cannot send data if the connection is not in the 'Connected' State.
    at HttpConnection.send (node_modules_@microsoft_signalr_...js:1515:35)
    at HubConnection._sendMessage (...js:2611:32)
    at HubConnection.invoke (...js:2650:19)
    at updateStatus (_0r-kd6d._.js:443:45)
    at PresenceProvider.useEffect.handleActivity (_0r-kd6d._.js:405:25)

[browser] Error: Connection disconnected with error 'Error: Server returned an error on close: Connection closed with an error.'
    at HttpConnection._stopConnection (...)
    at WebSocketTransport._close (...)
    at WebSocketTransport.stop (...)
    at HttpConnection._stopInternal (...)
    at async HttpConnection.stop (...)
```

### Steps to Reproduce
1. Connect to dashboard (BUG-001 fix applied — connection establishes)
2. Wait for connection to drop (server sends error close frame)
3. Move the mouse during the reconnection window
4. Observe "Cannot send data" error in console

### Environment
- **OS**: Windows 11
- **Browser**: Chrome
- **Frontend**: Next.js 15 on `http://localhost:3000`
- **Backend**: ASP.NET Core 9.0 on `http://localhost:5100`

---

## 🔍 Investigation Log

### Phase 1: Root Cause Investigation

#### Step 1 — Is the backend crashing? (Ruling out server restart)
```powershell
netstat -ano | findstr :5100
# Output:
# TCP  0.0.0.0:5100    LISTENING  4408
# TCP  127.0.0.1:5100  ...  TIME_WAIT
# TCP  127.0.0.1:5100  ...  ESTABLISHED  4408
```
- ✅ **Backend PID 4408 is still running** — server did NOT restart
- ✅ ESTABLISHED connections exist — connection CAN be made
- ⚠️ TIME_WAIT entries = previous connections that closed and recycled

**Conclusion**: The disconnect is NOT from a server crash or dotnet watch restart.

#### Step 2 — Code analysis: Why does `updateStatus` throw?

Tracing backward from the error:
```
updateStatus() → connectionRef.current.invoke() → throws "not Connected"
```

Found the bug in `updateStatus` (line 92–100):
```tsx
// BUGGY CODE:
if (connectionRef.current && session?.user?.id) {
  await connectionRef.current.invoke("UpdateStatus", ...);
}
```

**The guard only checks `connectionRef.current !== null`.**

But `connectionRef.current` is **never set back to null** when the connection drops. It's only set once in the `.then()` callback on line 43, and the cleanup on line 51 only calls `connection.stop()` — it doesn't null out the ref.

So after a disconnection:
- `connectionRef.current` → still holds the old connection object (not null)
- `conn.state` → `HubConnectionState.Reconnecting` (NOT `Connected`)
- Guard passes → `invoke()` is called → **throws**

#### Step 3 — What causes the initial "Connection closed with an error"?
The server is explicitly sending a non-normal WebSocket close frame. This could be:
- The backend `dotnet watch run` was restarting due to the `Program.cs` file change we made earlier (changing `0.0.0.0` to `*`)
- Note: The backend PID (4408) is still the same old process that bound to `0.0.0.0` — the `*` change hasn't taken effect yet because `dotnet watch` restarts when it detects the file change, then the new instance runs.

#### Evidence Summary
| Check | Result |
|-------|--------|
| Backend still running | ✅ PID 4408 alive |
| `connectionRef.current` is null during reconnect | ❌ It's NOT null — it still holds old connection |
| `connection.state` is `Connected` during reconnect | ❌ State is `Reconnecting` |
| `updateStatus` checks actual state before invoking | ❌ **Missing — only checks null** |

### Phase 2: Pattern Analysis

The SignalR client library exposes `HubConnectionState` enum:
- `Disconnected`
- `Connecting`
- `Connected`
- `Disconnecting`
- `Reconnecting`

The correct guard pattern is:
```tsx
conn.state === signalR.HubConnectionState.Connected
```

The existing code only checked if the ref is non-null — it never checked the **state machine**.

### Phase 3: Hypothesis

> "The `updateStatus` function only guards against a null `connectionRef`, but not against a reconnecting/disconnected state. Adding a `conn.state === signalR.HubConnectionState.Connected` check will prevent invoking on a non-connected hub."

**Minimal change**: Add exactly one condition to the existing `if` guard.

---

## 🔧 Fix Attempts

### Attempt #1
- **Date**: 2026-04-26
- **Hypothesis**: Missing `HubConnectionState.Connected` state check in `updateStatus`
- **Change Made**:

  **`frontend/lib/presence/PresenceProvider.tsx`** (line 92–100):
  ```diff
  - const updateStatus = async (newStatus: PresenceStatus) => {
  -   setStatus(newStatus);
  -   if (connectionRef.current && session?.user?.id) {
  -     try {
  -       await connectionRef.current.invoke("UpdateStatus", session.user.id, newStatus);
  -     } catch (err) {
  -       console.error("Failed to update status via SignalR", err);
  -     }
  -   }
  - };
  + const updateStatus = async (newStatus: PresenceStatus) => {
  +   setStatus(newStatus);
  +   const conn = connectionRef.current;
  +   if (conn && session?.user?.id && conn.state === signalR.HubConnectionState.Connected) {
  +     try {
  +       await conn.invoke("UpdateStatus", session.user.id, newStatus);
  +     } catch (err) {
  +       console.error("Failed to update status via SignalR", err);
  +     }
  +   }
  + };
  ```

- **Result**: 🟠 Fix applied — awaiting user verification
- **User Verdict**: ⏳ Pending

---

## ✅ Resolution

> **Status**: 🟢 Resolved

### Confirmed Fix
The fix was confirmed by the user. Mouse movements and activity during reconnection windows no longer trigger console errors. The `updateStatus` function now gracefully skips SignalR invocation if the connection isn't ready.

### Root Cause (Final Verdict)
`updateStatus` only checked `connectionRef.current !== null` before invoking, but never validated the actual `HubConnectionState`. In React, refs persist across renders and don't automatically clear on connection drops. During reconnection, the ref held a connection object in the `Reconnecting` state, causing `invoke()` to fail.

### What We Learned
Never rely solely on a `ref.current` existence check when dealing with stateful objects like SignalR connections or WebSockets. Always check the actual state machine of the object (e.g., `conn.state === Connected`) before performing operations.

### Files Changed
| File | Change |
|------|--------|
| `frontend/lib/presence/PresenceProvider.tsx` | Added `conn.state === signalR.HubConnectionState.Connected` guard to `updateStatus` |

---

## 🎓 Interview Notes

**Question**: "How do you handle race conditions between UI events and background socket connections in React?"

**Answer**:
"I recently solved a bug where mouse activity triggers were crashing the app because they tried to send data through a SignalR connection that was in a 'Reconnecting' state. The issue was that we were storing the connection in a `useRef` and only checking if the ref was null. In React, a ref stays populated even when the socket drops. I fixed it by implementing a state machine check within the update handler: before calling `invoke()`, we now verify that `connection.state` is explicitly `Connected`. This ensures that UI activity remains decoupled from the transient state of the network connection."
