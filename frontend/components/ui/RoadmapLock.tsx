"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RoadmapLockProps {
  children: ReactNode;
  phase: number;
  label: string;
  className?: string;
}

export function RoadmapLock({ children, phase, label, className }: RoadmapLockProps) {
  return (
    <div className={cn("group relative cursor-not-allowed", className)}>
      <div className="opacity-50 grayscale pointer-events-none">
        {children}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        <span className="font-bold text-relay-accent">{label}</span>
        <span className="mx-1">•</span>
        <span className="text-relay-text-secondary">Coming in Phase {phase}</span>
      </div>
    </div>
  );
}
