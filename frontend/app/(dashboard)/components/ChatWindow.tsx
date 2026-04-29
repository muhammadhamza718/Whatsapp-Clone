"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/ky";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Send, Loader2, Info, MoreVertical, Phone, Video, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GroupSettingsModal } from "@/components/modals/GroupSettingsModal";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  id: string;
}

export function ChatWindow({ id }: ChatWindowProps) {
  const { data: session } = authClient.useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversation Data & Messages
  useEffect(() => {
    if (!session?.user?.id) return;

    const initChat = async () => {
      setLoading(true);
      try {
        // Fetch conversation details (we might need a GET /api/conversations/{id} endpoint)
        const convData = await api.get(`conversations/${id}`, {
          headers: { "X-User-Id": session.user.id }
        }).json();
        setConversation(convData);

        const msgs = await api.get(`conversations/${id}/messages`, {
          headers: { "X-User-Id": session.user.id }
        }).json<Message[]>();
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to init chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [id, session?.user?.id]);

  // 2. Setup SignalR Connection
  useEffect(() => {
    if (!session?.user?.id || !id) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5100"}/hubs/chat?userId=${session.user.id}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    newConnection.start()
      .then(() => {
        console.log("Connected to ChatHub");
        newConnection.invoke("JoinConversation", id);
        setConnection(newConnection);
      })
      .catch(err => console.error("SignalR Connection Error:", err));

    newConnection.on("ReceiveMessage", (message: Message) => {
      if (message.conversationId === id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      if (newConnection) {
        newConnection.invoke("LeaveConversation", id);
        newConnection.stop();
      }
    };
  }, [id, session?.user?.id]);

  // 3. Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !connection || !session?.user?.id) return;

    try {
      await connection.invoke("SendMessage", id, session.user.id, input.trim());
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-relay-card">
        <Loader2 className="animate-spin text-relay-accent mb-4" size={40} />
        <p className="text-relay-text-secondary animate-pulse">Decrypting messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-relay-card relative overflow-hidden">
      {/* Chat Header */}
      <header className="h-[68px] flex items-center justify-between px-6 border-b border-relay-border bg-white/5 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <Avatar 
            src={conversation?.image} 
            name={conversation?.name} 
            size="md"
            status={conversation?.targetUserStatus}
            showDot={conversation?.type === 0}
          />
          <div>
            <h3 className="text-[15px] font-bold text-white leading-tight">{conversation?.name}</h3>
            <p className="text-[11px] text-emerald-400 font-medium">
              {conversation?.targetUserStatus === "online" ? "Active Now" : "End-to-End Encrypted"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HeaderAction icon={<Phone size={18} />} disabled />
          <HeaderAction icon={<Video size={18} />} disabled />
          <HeaderAction 
            icon={<Info size={18} />} 
            onClick={() => setIsSettingsOpen(true)} 
            active={isSettingsOpen}
          />
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-90"
      >
        <div className="flex flex-col gap-2">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === session?.user?.id;
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
            
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex items-end gap-2 max-w-[80%]",
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {!isMe && (
                  <div className="w-8 h-8 shrink-0">
                    {showAvatar ? (
                      <Avatar name="User" size="sm" />
                    ) : <div className="w-8" />}
                  </div>
                )}
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-[14px] shadow-sm relative group",
                  isMe 
                    ? "bg-emerald-500 text-black rounded-br-none" 
                    : "bg-relay-surf text-white rounded-bl-none border border-white/5"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className={cn(
                    "text-[9px] mt-1 block opacity-40 font-bold",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white/5 backdrop-blur-xl border-t border-relay-border">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3 bg-relay-input border border-white/10 rounded-2xl px-4 py-2 transition-all focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5">
          <button type="button" className="text-white/30 hover:text-white transition-colors">
             <Plus size={20} />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 py-2"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-emerald-500 text-black p-2 rounded-xl hover:bg-emerald-400 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:active:scale-100 shadow-lg shadow-emerald-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>

      {conversation?.type === 1 && (
        <GroupSettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          conversationId={id}
          conversationName={conversation.name}
          isAdmin={conversation.members?.find((m: any) => m.userId === session?.user?.id)?.role === 0}
        />
      )}
    </div>
  );
}

function HeaderAction({ icon, onClick, disabled = false, active = false }: { icon: React.ReactNode, onClick?: () => void, disabled?: boolean, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-emerald-500/10 text-emerald-400" : "text-white/30 hover:bg-white/10 hover:text-white",
        disabled && "opacity-20 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}
