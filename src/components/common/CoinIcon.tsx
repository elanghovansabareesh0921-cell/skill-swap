"use client";

import React from "react";

interface CoinIconProps {
  className?: string;
  size?: number;
}

/**
 * Standardized SkillSwap Credits Coin Icon — Dark Neo-Brutalist Edition
 * High-contrast Electric Yellow with solid black border & bold glyph.
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
      <circle cx="12" cy="12" r="10" fill="#FFE600" stroke="#000000" strokeWidth="2" />
      <path
        d="M12 6.5V17.5M8.5 9.5C8.5 8.4 9.6 7.5 11.5 7.5H12.5C14.2 7.5 15.5 8.8 15.5 10.5C15.5 12 14.2 13 12.5 13H11.5C9.8 13 8.5 14.2 8.5 15.5C8.5 17 9.8 18 11.5 18H12.5C14.4 18 15.5 17.1 15.5 16"
        stroke="#000000"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
