import * as React from "react"
import { cn } from "cn"

export interface GradientGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "intense" | "top-only"
}

export function GradientGlow({
  className,
  variant = "default",
  ...props
}: GradientGlowProps) {
  const opacityMap = {
    subtle: "opacity-15",
    default: "opacity-20",
    intense: "opacity-25",
    "top-only": "opacity-20",
  }

  return (
    <div
      aria-hidden="true"
      data-slot="gradient-glow"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none",
        opacityMap[variant] || "opacity-20",
        className
      )}
      {...props}
    >
      {/* Indigo/Violet Blob 1 - Top Left */}
      <div className="absolute top-[-12%] left-[-10%] h-137.5 w-137.5 rounded-full bg-brand-accent blur-[130px] transform-gpu will-change-transform" />

      {/* Cyan Blob 2 - Top Right */}
      <div className="absolute top-[2%] right-[-8%] h-130 w-130 rounded-full bg-brand-accent-light blur-[120px] transform-gpu will-change-transform" />

      {/* Indigo/Cyan Ambient Blob 3 - Center/Bottom */}
      {variant !== "top-only" && (
        <div className="absolute top-[48%] left-[20%] h-150 w-150 -translate-x-1/2 rounded-full bg-[#6366F1] blur-[150px] transform-gpu will-change-transform" />
      )}
    </div>
  )
}
