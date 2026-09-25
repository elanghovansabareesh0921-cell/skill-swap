import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#7C6CF6] via-[#6857F3] to-[#06B6D4] text-white shadow-[0_4px_20px_-4px_rgba(124,108,246,0.5)] hover:shadow-[0_6px_24px_-2px_rgba(6,182,212,0.5)] hover:brightness-110 active:brightness-95 border-0",
        primary:
          "bg-gradient-to-r from-[#7C6CF6] via-[#6857F3] to-[#06B6D4] text-white shadow-[0_4px_20px_-4px_rgba(124,108,246,0.5)] hover:shadow-[0_6px_24px_-2px_rgba(6,182,212,0.5)] hover:brightness-110 active:brightness-95 border-0",
        secondary:
          "border border-white/10 bg-white/[0.05] text-foreground backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-white/[0.09] hover:border-white/20 hover:text-white active:bg-white/[0.04]",
        outline:
          "border border-white/15 bg-white/[0.03] text-foreground backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-white/[0.08] hover:border-white/25 hover:text-white active:bg-white/[0.02]",
        ghost:
          "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground active:bg-white/[0.04]",
        destructive:
          "bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 hover:border-red-500/40 hover:text-red-300",
        link:
          "text-[#7C6CF6] underline-offset-4 hover:underline hover:text-[#06B6D4]",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs:
          "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-11 gap-2 rounded-xl px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
