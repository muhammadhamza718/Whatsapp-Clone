"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Mail, User, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { AvatarUpload } from "./AvatarUpload";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Update form when session data arrives
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

      if (updateError) {
        throw new Error(updateError.message || "Failed to update profile");
      }

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[440px] bg-relay-card border border-relay-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-relay-border">
              <h2 className="text-[10px] font-semibold text-relay-text-secondary uppercase tracking-wider">
                Profile Settings
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-relay-subtle rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-relay-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-5">
                <AvatarUpload
                  value={avatarUrl}
                  name={userName}
                  onChange={(url) => setValue("image", url, { shouldDirty: true })}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-relay-text-primary truncate">
                    {userName || "Your Name"}
                  </p>
                  <p className="text-[11px] text-relay-text-secondary truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-relay-text-secondary">
                    Display name
                  </label>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 bg-relay-input border border-relay-border-strong rounded-lg transition-all",
                    "focus-within:border-relay-accent focus-within:bg-relay-card"
                  )}>
                    <User className="w-4 h-4 text-relay-text-secondary" />
                    <input
                      {...register("name")}
                      placeholder="Enter your name"
                      className="flex-1 bg-transparent border-none outline-none text-[13px] text-relay-text-primary placeholder:text-relay-text-secondary"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[10px] text-red-500 px-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5 opacity-60">
                  <label className="text-[11px] font-medium text-relay-text-secondary">
                    Email address (read-only)
                  </label>
                  <div className="flex items-center gap-3 px-3 py-2 bg-relay-input border border-relay-border-strong rounded-lg">
                    <Mail className="w-4 h-4 text-relay-text-secondary" />
                    <span className="text-[13px] text-relay-text-primary">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-[11px] text-red-600 dark:text-red-400 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 bg-relay-btn text-white rounded-lg text-[13px] font-semibold transition-all shadow-md",
                    "hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
