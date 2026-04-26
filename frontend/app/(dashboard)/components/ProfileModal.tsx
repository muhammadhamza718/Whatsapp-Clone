"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Mail, User, Loader2, Info, Clock, Wifi } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { AvatarUpload } from "./AvatarUpload";
import { cn } from "@/lib/utils";
import { usePresence, type PresenceStatus } from "@/lib/presence/PresenceProvider";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session } = authClient.useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Presence State from Provider
  const { 
    status: presence, 
    idleMinutes, 
    maxIdleMinutes, 
    setManualStatus: setPresence,
    isConnected
  } = usePresence();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      image: session?.user?.image || null,
    },
  });

  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || "",
        image: session.user.image || null,
      });
    }
  }, [session, reset]);

  const avatarUrl = watch("image");
  const userName = watch("name");

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const { error: updateError } = await authClient.updateUser({
        name: values.name,
        image: values.image || "",
      });
      if (updateError) throw new Error(updateError.message);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
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
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[480px] bg-relay-card border border-relay-border rounded-[14px] shadow-2xl overflow-hidden"
          >
            {/* Modal Header - Sticky */}
            <div className="flex items-center justify-between p-3.5 px-[18px] border-b border-relay-border bg-relay-subtle sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <span className="text-[18px] font-bold text-relay-accent tracking-[-0.8px]">relay</span>
                <span className="text-[11px] font-medium text-relay-text-secondary px-2 py-0.5 bg-relay-input border border-relay-border-strong rounded-full">
                  Settings
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-[26px] h-[26px] flex items-center justify-center bg-relay-input hover:bg-relay-border rounded-md transition-colors"
              >
                <X className="w-3 h-3 text-relay-text-secondary" />
              </button>
            </div>

            {/* Nav Tabs - Sticky */}
            <div className="flex gap-1 p-2.5 px-[14px] border-b border-relay-border bg-relay-subtle sticky top-[49px] z-20">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium bg-relay-accent/10 text-relay-accent">
                <User className="w-3.5 h-3.5" />
                Profile
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] text-relay-text-secondary hover:bg-relay-input transition-colors">
                <Wifi className="w-3.5 h-3.5" />
                Presence
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] text-relay-text-secondary hover:bg-relay-input transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Notifications
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="modal-scroll p-5 overflow-y-auto max-h-[480px]">
              {/* Profile Section */}
              <section id="profile" className="space-y-4">
                <p className="text-[10px] font-bold text-relay-text-secondary uppercase tracking-[0.05em] mb-3">
                  Profile
                </p>

                <div className="flex items-end gap-3.5 p-3.5 bg-relay-input border border-relay-border rounded-[10px] mb-4.5">
                  <div className="relative shrink-0">
                    <AvatarUpload
                      value={avatarUrl}
                      name={userName}
                      onChange={(url) => setValue("image", url, { shouldDirty: true })}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#1D9E75] border-2 border-relay-input" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-relay-text-primary truncate mb-0.5">
                      {userName || "Your Name"}
                    </p>
                    <p className="text-[11px] text-relay-text-secondary truncate mb-2.5">
                      {session?.user?.email}
                    </p>
                    <div className="flex gap-1.5">
                      <button className="px-2.5 py-1 bg-relay-accent/10 border border-relay-border-strong rounded-md text-[11px] font-medium text-relay-accent">
                        Upload photo
                      </button>
                      <button className="px-2.5 py-1 bg-relay-input border border-relay-border-strong rounded-md text-[11px] text-relay-text-secondary">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[10px] text-relay-text-secondary">Initials fallback</span>
                    <div className="flex gap-1.25">
                       {["AK", "NR", "ZM"].map((init, i) => (
                         <div key={i} className={cn(
                           "w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold",
                           i === 0 ? "bg-[#CECBF6] text-[#3C3489]" : 
                           i === 1 ? "bg-[#C0DD97] text-[#3B6D11]" : "bg-[#F5C4B3] text-[#712B13]"
                         )}>
                           {init}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                  <div className="space-y-1.25">
                    <label className="text-[11px] font-semibold text-relay-text-secondary ml-0.5">
                      Display name
                    </label>
                    <div className="flex items-center justify-between px-3 px-[11px] py-[9px] bg-relay-input border border-relay-border-strong rounded-[8px] focus-within:border-relay-accent transition-all">
                      <input
                        {...register("name")}
                        className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-relay-text-primary placeholder:text-relay-text-secondary"
                      />
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M10 2l2 2-8 8H2v-2L10 2Z" stroke="var(--relay-accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-1.25">
                    <label className="text-[11px] font-semibold text-relay-text-secondary ml-0.5">
                      Email address
                    </label>
                    <div className="px-3 px-[11px] py-[9px] bg-relay-input border border-relay-border-strong rounded-[8px] opacity-60">
                      <span className="text-[12.5px] text-relay-text-primary">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                </form>
              </section>

              <div className="h-[0.5px] bg-relay-border my-4.5" />

              {/* Presence Section */}
              <section id="presence" className="space-y-3.5">
                <p className="text-[10px] font-bold text-relay-text-secondary uppercase tracking-[0.05em] mb-2.5">
                  Presence
                </p>

                <div className="space-y-2">
                  <PresencePill 
                    status="online" 
                    active={presence === "online"} 
                    onClick={() => setPresence("online")}
                    label="Online"
                  />
                  <PresencePill 
                    status="away" 
                    active={presence === "away"} 
                    onClick={() => setPresence("away")}
                    label="Away"
                    hint="auto after 5 min"
                  />
                  <PresencePill 
                    status="offline" 
                    active={presence === "offline"} 
                    onClick={() => setPresence("offline")}
                    label="Appear offline"
                    hint="on disconnect"
                  />
                </div>

                {/* Auto-Away Timer */}
                <div className="bg-relay-input border border-relay-border rounded-[9px] p-2.5 px-3 space-y-2">
                  <div className="flex items-center gap-2 text-relay-text-primary">
                    <Clock className="w-3 h-3 text-relay-text-secondary" />
                    <span className="text-[11px] font-bold">Auto-Away timer</span>
                  </div>
                  
                  <div className="flex gap-0.5">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <div key={s} className={cn(
                         "flex-1 h-[3px] rounded-full transition-all duration-500",
                         s <= idleMinutes ? "bg-relay-accent" : "bg-relay-border-strong"
                       )} />
                     ))}
                  </div>
                  
                  <p className="text-[10.5px] text-relay-text-secondary">
                    {idleMinutes} of {maxIdleMinutes} minutes idle — switching to Away in {maxIdleMinutes - idleMinutes} min
                  </p>
                </div>

                {/* SignalR Badge */}
                <div className={cn(
                  "flex items-center gap-2 p-2 px-2.5 border rounded-lg transition-colors",
                  isConnected 
                    ? "bg-[#E1F5EE] dark:bg-[#04342C] border-[#1D9E75]" 
                    : "bg-red-50 dark:bg-red-900/20 border-red-200"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isConnected ? "bg-[#1D9E75]" : "bg-red-500"
                  )} />
                  <span className={cn(
                    "text-[10.5px] font-medium",
                    isConnected ? "text-[#085041] dark:text-[#9FE1CB]" : "text-red-700 dark:text-red-400"
                  )}>
                    {isConnected ? "SignalR hub connected — broadcasting to 1 client" : "SignalR disconnected — trying to reconnect..."}
                  </span>
                </div>
              </section>

              {/* Save Footer */}
              <div className="flex justify-end pt-5">
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving || !isDirty}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-relay-accent text-white rounded-lg text-[12.5px] font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PresencePill({ 
  status, 
  active, 
  onClick, 
  label, 
  hint 
}: { 
  status: PresenceStatus; 
  active: boolean; 
  onClick: () => void; 
  label: string;
  hint?: string;
}) {
  const colors: Record<PresenceStatus, string> = {
    online: active ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041] dark:bg-[#04342C] dark:text-[#9FE1CB]" : "bg-relay-input border-relay-border text-relay-text-primary",
    away: active ? "bg-[#FAEEDA] border-[#EF9F27] text-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]" : "bg-relay-input border-relay-border text-relay-text-primary",
    offline: active ? "bg-[#F1EFE8] border-relay-border-strong text-[#5F5E5A] dark:bg-[#2C2C2A] dark:text-[#B4B2A9]" : "bg-relay-input border-relay-border text-relay-text-primary",
  };

  const dots: Record<PresenceStatus, string> = {
    online: "bg-[#1D9E75]",
    away: "bg-[#EF9F27]",
    offline: "bg-[#B4B2A9]",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-[9px] border rounded-[10px] transition-all active:scale-[0.98]",
        colors[status]
      )}
    >
      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dots[status])} />
      <span className="flex-1 text-left text-[12.5px] font-medium">{label}</span>
      {hint && <span className="text-[10.5px] text-relay-text-secondary">{hint}</span>}
      {active && <Check className="w-3 h-3" />}
    </button>
  );
}
