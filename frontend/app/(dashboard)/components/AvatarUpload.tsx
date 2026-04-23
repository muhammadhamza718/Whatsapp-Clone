"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string | null;
  name?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function AvatarUpload({
  value,
  name,
  onChange,
  className,
}: AvatarUploadProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <Avatar
          src={value}
          name={name}
          size="xl"
          className="w-24 h-24 ring-4 ring-zinc-100 dark:ring-zinc-800 transition-all group-hover:opacity-90"
        />
        
        <CldUploadWidget
          uploadPreset="whatsapp_clone" // Make sure to create this in Cloudinary settings
          onSuccess={(result: any) => {
            if (result.info && typeof result.info !== "string") {
              onChange(result.info.secure_url);
            }
          }}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "png", "webp"],
            maxFileSize: 2000000, // 2MB
          }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-[#1D9E75] text-white rounded-full shadow-lg hover:bg-[#168663] transition-colors"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </CldUploadWidget>
      </div>

      {value && (
        <button
          onClick={() => onChange(null)}
          type="button"
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove Photo</span>
        </button>
      )}
    </div>
  );
}
