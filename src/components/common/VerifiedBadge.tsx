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
 * Verified Skill Badge
 * Small badge/checkmark treatment for proven skills.
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
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-colors ${
        isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      } bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] border-[#ddd4f5] dark:border-[#362c5e] ${className}`}
      title="Verified skill: proven proficiency by peer review"
    >
      <span className="w-3.5 h-3.5 rounded-full bg-[#7d6ce8] text-white flex items-center justify-center shrink-0">
        <Check className="w-2.5 h-2.5 stroke-[3]" />
      </span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
