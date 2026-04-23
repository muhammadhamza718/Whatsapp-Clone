"use client";

import { CldImage } from "next-cloudinary";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDot?: boolean;
  dotColor?: string;
}

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
  dotColor = "bg-[#1D9E75]", // Online green
}: AvatarProps) {
  const initials = getInitials(name || "");
  const colors = getAvatarColor(name || "");

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "av rounded-full flex items-center justify-center font-medium overflow-hidden",
          sizes[size]
        )}
        style={!src ? { backgroundColor: colors.bg, color: colors.text } : {}}
      >
        {src ? (
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
            "dot absolute bottom-0 right-0 rounded-full border-white dark:border-[#13151A]",
            dotSizes[size],
            dotColor
          )}
        />
      )}
    </div>
  );
}
