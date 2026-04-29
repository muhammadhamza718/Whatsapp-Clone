"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Settings, UserMinus, Edit2, Shield, User } from "lucide-react";
import { api } from "@/lib/ky";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Member {
  userId: string;
  role: number; // 0 for Admin, 1 for Member
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    status: string;
  };
}

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  isAdmin: boolean;
}

export function GroupSettingsModal({ 
  isOpen, 
  onClose, 
  conversationId, 
  conversationName,
  isAdmin 
}: GroupSettingsModalProps) {
  const { data: session } = authClient.useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState(conversationName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setNewName(conversationName);
    }
  }, [isOpen, conversationId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // We'll need an endpoint to fetch members of a conversation
      const response = await api.get(`conversations/${conversationId}/members`, {
        headers: { "X-User-Id": session?.user?.id || "" }
      }).json<Member[]>();
      setMembers(response);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  const renameGroup = async () => {
    if (!isAdmin || !newName || newName === conversationName) return;
    setProcessing(true);
    try {
      await api.patch(`conversations/${conversationId}/rename`, {
        json: { newName },
        headers: { "X-User-Id": session?.user?.id || "" }
      });
      setIsEditingName(false);
      // We might need to refresh the conversation list or name in parent
    } catch (error) {
      console.error("Failed to rename group", error);
    } finally {
      setProcessing(false);
    }
  };

  const removeMember = async (targetUserId: string) => {
    if (!isAdmin || targetUserId === session?.user?.id) return;
    setProcessing(true);
    try {
      await api.delete(`conversations/${conversationId}/members/${targetUserId}`, {
        headers: { "X-User-Id": session?.user?.id || "" }
      });
      setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
    } catch (error) {
      console.error("Failed to remove member", error);
    } finally {
      setProcessing(false);
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                  <Settings size={22} />
                </div>
                <h2 className="text-xl font-bold text-white">Group Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Name Editing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Group Name</label>
                  {isAdmin && (
                    <button 
                      onClick={() => setIsEditingName(!isEditingName)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      {isEditingName ? "Cancel" : "Edit"}
                    </button>
                  )}
                </div>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-white outline-none focus:border-amber-500/50"
                    />
                    <button
                      onClick={renameGroup}
                      disabled={processing || !newName}
                      className="rounded-2xl bg-amber-500 px-4 font-bold text-black disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="animate-spin" size={18} /> : "Save"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-white/5 bg-white/2 py-4 px-4 text-white font-semibold">
                    {conversationName}
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Members ({members.length})</label>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-amber-400" size={32} />
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-4 rounded-2xl p-3 bg-white/2 border border-white/5"
                      >
                        <Avatar
                          src={member.user.image}
                          name={member.user.name}
                          status={member.user.status as any}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-semibold text-white">
                              {member.user.name}
                            </span>
                            {member.role === 0 && (
                              <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-400 border border-amber-500/20">
                                <Shield size={8} /> Admin
                              </div>
                            )}
                          </div>
                          <span className="truncate text-xs text-white/30">
                            {member.user.email}
                          </span>
                        </div>

                        {isAdmin && member.userId !== session?.user?.id && (
                          <button
                            onClick={() => removeMember(member.userId)}
                            disabled={processing}
                            className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-50"
                            title="Remove from group"
                          >
                            <UserMinus size={18} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
