"use client";

import React from "react";

interface CoinIconProps {
  className?: string;
  size?: number;
}

/**
 * Standardized SkillSwap Credits Coin Icon
 * Uses the exact gold color #f5a524 strictly for credit representation.
 */
export default function CoinIcon({ className = "", size = 18 }: CoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="SkillSwap Credits"
    >
      <circle cx="12" cy="12" r="10" fill="#f5a524" />
      <circle cx="12" cy="12" r="8" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
      <path
        d="M12 7V17M9 9.5C9 8.67 9.8 8 11.5 8H12.5C13.88 8 15 9.12 15 10.5C15 11.88 13.88 13 12.5 13H11.5C10.12 13 9 14.12 9 15.5C9 16.88 10.12 18 11.5 18H12.5C14.2 18 15 17.33 15 16.5"
        stroke="#ffffff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
