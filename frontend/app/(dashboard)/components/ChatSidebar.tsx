"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Hash } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTime } from "@/lib/utils";
import { usePresence } from "@/lib/presence/PresenceProvider";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/ky";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  status: "online" | "away" | "offline";
  lastSeenAt: string;
}

export function ChatSidebar() {
  const { data: session } = authClient.useSession();
  const { connection } = usePresence();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Users
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUsers = async () => {
      try {
        const data = await api.get(`users?excludeId=${session.user.id}`).json<User[]>();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session?.user?.id]);

  // 2. Listen for SignalR Status Changes
  useEffect(() => {
    if (!connection) return;

    const handleStatusChange = (userId: string, status: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, status: status as any, lastSeenAt: status === "offline" ? new Date().toISOString() : u.lastSeenAt } : u
        )
      );
    };

    connection.on("UserStatusChanged", handleStatusChange);

    return () => {
      connection.off("UserStatusChanged");
    };
  }, [connection]);

  return (
    <div className="w-[260px] bg-relay-surf border-r border-relay-border flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="p-[13px] px-4 border-b border-relay-border flex items-center justify-between">
        <span className="text-[19px] font-bold text-relay-accent tracking-tighter">relay</span>
        <button className="p-1 text-relay-text-secondary hover:bg-relay-subtle rounded-md">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 pt-4">
        <div className="bg-relay-input border border-relay-border rounded-xl px-3 py-2 flex items-center gap-2 transition-all focus-within:border-relay-accent">
          <Search className="w-3.5 h-3.5 text-relay-text-secondary" />
          <input 
            placeholder="Search conversations..." 
            className="bg-transparent border-none outline-none text-[12px] text-relay-text-primary placeholder:text-relay-text-secondary w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-2 pb-1">
           <p className="text-[10px] font-bold text-relay-text-secondary uppercase tracking-[0.05em]">Direct messages</p>
        </div>

        <div className="space-y-[1px] px-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8.5 h-8.5 bg-relay-subtle rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-relay-subtle rounded w-24" />
                    <div className="h-2 bg-relay-subtle rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[11px] text-relay-text-secondary">No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <ChatCard key={user.id} user={user} />
            ))
          )}
        </div>

        <div className="px-4 pt-4 pb-1">
           <p className="text-[10px] font-bold text-relay-text-secondary uppercase tracking-[0.05em]">Rooms</p>
        </div>

        <div className="space-y-[1px] px-2">
           <RoomCard name="general" members={12} />
           <RoomCard name="design" members={8} unread={7} />
        </div>
      </div>
    </div>
  );
}

function ChatCard({ user }: { user: User }) {
  return (
    <button className="w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-relay-subtle group">
      <Avatar
        src={user.image}
        name={user.name}
        size="md"
        showDot
        status={user.status}
        className="w-8.5 h-8.5"
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[12.5px] font-semibold text-relay-text-primary truncate">{user.name}</span>
          <span className="text-[10px] text-relay-text-secondary shrink-0">
            {user.status === "offline" ? formatTime(user.lastSeenAt) : "now"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className="text-[11.5px] truncate text-relay-text-secondary">
            {user.status === "online" ? "Active now" : user.status === "away" ? "Away" : "Last seen recently"}
          </p>
        </div>
      </div>
    </button>
  );
}

function RoomCard({ name, members, unread }: { name: string; members: number; unread?: number }) {
  return (
    <button className="w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-relay-subtle group">
      <div className="w-8.5 h-8.5 bg-relay-input border border-relay-border rounded-lg flex items-center justify-center shrink-0">
        <Hash className="w-4 h-4 text-relay-accent" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-relay-text-primary truncate">{name}</span>
          {unread && (
            <span className="bg-[#D85A30] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unread}
            </span>
          )}
        </div>
        <p className="text-[11px] text-relay-text-secondary truncate">{members} members</p>
      </div>
    </button>
  );
}
