"use client";

import { CldImage } from "next-cloudinary";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDot?: boolean;
  status?: "online" | "away" | "offline";
  isLoading?: boolean;
}

const statusColors = {
  online: "bg-[#1D9E75]",
  away: "bg-[#EF9F27]",
  offline: "bg-[#B4B2A9]",
};

const sizes = {
  sm: "w-6 h-6 text-[8px]",
  md: "w-8.5 h-8.5 text-[11px]", // 34px
  lg: "w-12 h-12 text-[15px]",  // 48px
  xl: "w-16 h-16 text-[18px]",  // 64px
};

const dotSizes = {
  sm: "w-1.5 h-1.5 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  showDot = false,
  status = "offline",
  isLoading = false,
}: AvatarProps) {
  const initials = getInitials(name || "");
  const colors = getAvatarColor(name || "");

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "av rounded-full flex items-center justify-center font-medium overflow-hidden transition-all",
          sizes[size],
          isLoading && "opacity-50 grayscale-[0.5]"
        )}
        style={!src ? { backgroundColor: colors.bg, color: colors.text } : {}}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-1/2 h-1/2 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        ) : src ? (
          <CldImage
            src={src}
            alt={name || "User avatar"}
            width={128}
            height={128}
            crop="fill"
            gravity="faces"
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {showDot && (
        <div
          className={cn(
            "dot absolute bottom-0 right-0 rounded-full border-white dark:border-[#13151A] transition-colors",
            dotSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
