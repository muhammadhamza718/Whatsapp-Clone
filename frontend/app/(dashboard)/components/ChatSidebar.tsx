"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Users, Hash, Loader2, MessageSquarePlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTime } from "@/lib/utils";
import { usePresence } from "@/lib/presence/PresenceProvider";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/ky";
import { NewDMModal } from "@/components/modals/NewDMModal";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  type: number; // 0 for DM, 1 for Group
  name?: string;
  image?: string;
  latestMessage?: string;
  latestMessageTimestamp?: string;
  unreadCount: number;
  targetUserId?: string;
  targetUserStatus?: string;
}

export function ChatSidebar() {
  const { data: session } = authClient.useSession();
  const { connection } = usePresence();
  const params = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;
    try {
      const data = await api.get("conversations", {
        headers: { "X-User-Id": session.user.id }
      }).json<Conversation[]>();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Fetch Conversations
  useEffect(() => {
    fetchConversations();
  }, [session?.user?.id]);

  // 2. Listen for SignalR Status Changes (for DMs)
  useEffect(() => {
    if (!connection) return;

    const handleStatusChange = (userId: string, status: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.targetUserId === userId ? { ...c, targetUserStatus: status as any } : c
        )
      );
    };

    connection.on("UserStatusChanged", handleStatusChange);

    const handleConversationCreated = (conversationId: string) => {
      // Re-fetch conversations when a new one is created
      fetchConversations();
    };

    connection.on("ConversationCreated", handleConversationCreated);

    const handleMessageReceived = (message: any) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === message.conversationId);
        if (index === -1) return prev; // Should be handled by ConversationCreated

        const updated = [...prev];
        const conv = { ...updated[index] };
        conv.latestMessage = message.content;
        conv.latestMessageTimestamp = message.timestamp;
        // Increment unread if not currently in this conversation
        // This is a bit complex as we don't know the active conversation here easily without extra state
        // But for now, we'll just update the text and sort
        updated.splice(index, 1);
        return [conv, ...updated];
      });
    };

    connection.on("MessageReceived", handleMessageReceived);

    return () => {
      connection.off("UserStatusChanged");
      connection.off("ConversationCreated");
      connection.off("MessageReceived");
    };
  }, [connection, session?.user?.id]);

  return (
    <div className="w-[320px] flex flex-col bg-relay-surf border-r border-relay-border shrink-0 transition-all">
      {/* Brand */}
      <div className="p-4 border-b border-relay-border flex items-center justify-between bg-white/5 backdrop-blur-md">
        <span className="text-2xl font-black text-relay-accent tracking-tighter">relay</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsNewGroupOpen(true)}
            className="p-2 text-white/30 hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-all active:scale-95"
            title="New Group"
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsNewDMOpen(true)}
            className="p-2 text-white/30 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all active:scale-95"
            title="New Direct Message"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="group relative bg-relay-input border border-relay-border rounded-2xl px-4 py-2.5 flex items-center gap-3 transition-all focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5">
          <Search className="w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            placeholder="Search chats..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-5 pt-2 pb-2">
           <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Recent Chats</p>
        </div>

        <div className="space-y-1 px-2 pb-6">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse opacity-20">
                  <div className="w-12 h-12 bg-white rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white rounded w-24" />
                    <div className="h-2.5 bg-white rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                <MessageSquarePlus size={24} />
              </div>
              <p className="text-sm text-white/30 mb-4">No conversations yet.</p>
              <button 
                onClick={() => setIsNewDMOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationCard 
                key={conv.id} 
                conversation={conv} 
                isActive={params.id === conv.id}
              />
            ))
          )}
        </div>

        {/* Phase 4 Roadmap Preview */}
        <div className="mx-4 mt-2 mb-6 p-4 rounded-2xl border-2 border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center text-center group transition-all hover:bg-white/4">
          <Hash className="w-5 h-5 text-white/10 mb-2 group-hover:text-emerald-400 transition-colors" />
          <p className="text-[11px] font-medium text-white/20">Group Channels<br/>coming in Phase 4</p>
        </div>
      </div>

      <NewDMModal 
        isOpen={isNewDMOpen} 
        onClose={() => setIsNewDMOpen(false)} 
      />
      <CreateGroupModal 
        isOpen={isNewGroupOpen} 
        onClose={() => setIsNewGroupOpen(false)} 
      />
    </div>
  );
}

function ConversationCard({ conversation, isActive }: { conversation: Conversation; isActive: boolean }) {
  return (
    <Link href={`/conversations/${conversation.id}`} className="block">
      <div className={cn(
        "flex items-center gap-4 p-3 rounded-2xl transition-all group relative mx-1",
        isActive 
          ? "bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
          : "hover:bg-white/5 border border-transparent"
      )}>
        {/* Active Indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div 
              layoutId="activeIndicator"
              className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-full -translate-x-1"
            />
          )}
        </AnimatePresence>

        <Avatar
          src={conversation.image}
          name={conversation.name || "Group"}
          size="lg"
          showDot={conversation.type === 0}
          status={conversation.targetUserStatus as any}
          className={cn(
            "rounded-2xl ring-2 transition-all",
            isActive ? "ring-emerald-500/30" : "ring-transparent group-hover:ring-white/10"
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={cn(
              "text-sm font-bold truncate transition-colors",
              isActive ? "text-emerald-400" : "text-white"
            )}>
              {conversation.name}
            </span>
            <span className="text-[10px] font-medium text-white/20">
              {formatTime(conversation.latestMessageTimestamp || null)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-[12.5px] truncate transition-colors",
              isActive ? "text-white/60" : "text-white/30"
            )}>
              {conversation.latestMessage || "No messages yet"}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black shadow-lg shadow-emerald-500/20">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
