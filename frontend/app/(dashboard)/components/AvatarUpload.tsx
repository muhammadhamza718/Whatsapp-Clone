"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import ky from "ky";

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "whatsapp_clone");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await ky.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { body: formData }
      ).json<{ secure_url: string }>();

      onChange(response.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div className="relative group">
        <Avatar
          src={value}
          name={name}
          size="xl"
          isLoading={isUploading}
          className="w-24 h-24 ring-4 ring-zinc-100 dark:ring-zinc-800 transition-all group-hover:opacity-90"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          type="button"
          className="absolute bottom-0 right-0 p-2 bg-[#1D9E75] text-white rounded-full shadow-lg hover:bg-[#168663] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Change Photo"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
      </div>

      {value && !isUploading && (
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
