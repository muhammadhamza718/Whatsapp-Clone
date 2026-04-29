"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Users, Check } from "lucide-react";
import { api } from "@/lib/ky";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  status: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
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

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!session?.user?.id || !groupName || selectedUserIds.length === 0) return;
    setCreating(true);
    try {
      const response = await api.post("conversations/group", {
        json: { 
          name: groupName,
          memberIds: selectedUserIds
        },
        headers: {
          "X-User-Id": session.user.id
        }
      }).json<{ id: string }>();

      router.push(`/conversations/${response.id}`);
      onClose();
      // Reset state
      setGroupName("");
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Failed to create group", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <Users size={22} />
                </div>
                <h2 className="text-xl font-bold text-white">Create Group</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-4 text-white placeholder-white/30 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Add Members</label>
                <div className="group relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-blue-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto px-2 pb-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                  <Loader2 className="mb-3 animate-spin text-blue-400" size={32} />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="grid gap-1">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl p-3 transition-all mx-2",
                          isSelected ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <div className="relative">
                          <Avatar
                            src={user.image}
                            name={user.name}
                            status={user.status as any}
                            size="md"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-black rounded-full p-0.5 shadow-lg">
                              <Check size={12} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className={cn(
                            "truncate font-semibold transition-colors",
                            isSelected ? "text-blue-400" : "text-white"
                          )}>
                            {user.name}
                          </span>
                          <span className="truncate text-xs text-white/40">
                            {user.email}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-white/30">
                  <p>No users found</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={createGroup}
                disabled={creating || !groupName || selectedUserIds.length === 0}
                className="w-full rounded-2xl bg-blue-500 py-4 font-bold text-black shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:active:scale-100"
              >
                {creating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Creating Group...</span>
                  </div>
                ) : (
                  <span>Create Group ({selectedUserIds.length} selected)</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
