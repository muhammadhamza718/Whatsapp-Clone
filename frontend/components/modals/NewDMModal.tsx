"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, MessageSquarePlus } from "lucide-react";
import { api } from "@/lib/ky";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  status: string;
}

interface NewDMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDMModal({ isOpen, onClose }: NewDMModalProps) {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchUsers();
    }
  }, [isOpen, session?.user?.id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users excluding current user
      const response = await api.get(`users?excludeId=${session?.user.id}`).json<User[]>();
      setUsers(response);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startDM = async (targetUserId: string) => {
    if (!session?.user?.id) return;
    setCreating(true);
    try {
      const response = await api.post("conversations/dm", {
        json: { targetUserId },
        headers: {
          "X-User-Id": session.user.id
        }
      }).json<{ id: string }>();

      router.push(`/conversations/${response.id}`);
      onClose();
    } catch (error) {
      console.error("Failed to start DM", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <MessageSquarePlus size={22} />
                </div>
                <h2 className="text-xl font-bold text-white">New Chat</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <div className="group relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-emerald-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-[400px] overflow-y-auto px-2 pb-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                  <Loader2 className="mb-3 animate-spin text-emerald-400" size={32} />
                  <p>Finding people...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="grid gap-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startDM(user.id)}
                      disabled={creating}
                      className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/5 disabled:opacity-50"
                    >
                      <Avatar
                        src={user.image}
                        name={user.name}
                        status={user.status as any}
                        size="md"
                        className="ring-2 ring-transparent transition-all group-hover:ring-emerald-500/30"
                      />
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {user.name}
                        </span>
                        <span className="truncate text-sm text-white/40">
                          {user.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/30">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Loading Overlay for Creation */}
            <AnimatePresence>
              {creating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-emerald-400" size={40} />
                    <p className="font-medium text-white">Starting your conversation...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
