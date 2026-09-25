"use client";

import React from "react";
import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  showLabel?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Verified Skill Badge — Dark Neo-Brutalist Edition
 * High-contrast Neon Lime with thick black border and hard shadow.
 */
export default function VerifiedBadge({
  showLabel = true,
  label = "Verified",
  size = "sm",
  className = "",
}: VerifiedBadgeProps) {
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-black uppercase tracking-wider rounded-none border-2 border-black bg-[#A3E635] text-black shadow-[2px_2px_0px_0px_#000000] ${
        isSm ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"
      } ${className}`}
      title="Verified skill: proven proficiency by peer review"
    >
      <span className="w-3 h-3 rounded-none bg-black text-[#A3E635] flex items-center justify-center shrink-0">
        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
      </span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
