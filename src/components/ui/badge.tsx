import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-foreground whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all focus-visible:border-[#7C6CF6] focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/40 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.07] border-white/15 text-white hover:bg-white/10",
        secondary:
          "bg-white/[0.04] border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.08]",
        outline:
          "border-white/20 bg-transparent text-foreground hover:bg-white/[0.05]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
        destructive:
          "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20",
        link:
          "border-transparent bg-transparent text-[#7C6CF6] underline-offset-4 hover:underline hover:text-[#06B6D4]",
        pending:
          "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/15",
        active:
          "bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/15",
        success:
          "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15",
        error:
          "bg-rose-500/10 border-rose-500/25 text-rose-300 hover:bg-rose-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const statusDotStyles: Record<string, string> = {
  pending: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]",
  active: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse",
  success: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  error: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
}

export type BadgeStatus = "pending" | "active" | "success" | "error"

export interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  status?: BadgeStatus
  dot?: boolean
}

function Badge({
  className,
  variant = "default",
  status,
  dot,
  children,
  render,
  ...props
}: BadgeProps) {
  const effectiveStatus =
    status ||
    (variant === "pending" ||
    variant === "active" ||
    variant === "success" ||
    variant === "error"
      ? (variant as BadgeStatus)
      : undefined)

  const showDot = dot !== undefined ? dot : Boolean(effectiveStatus)

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
        children: (
          <>
            {showDot && effectiveStatus && statusDotStyles[effectiveStatus] && (
              <span
                data-slot="badge-dot"
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  statusDotStyles[effectiveStatus]
                )}
                aria-hidden="true"
              />
            )}
            {children}
          </>
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
