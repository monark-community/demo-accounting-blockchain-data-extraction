import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Monark 2026: every action is a pill. Primary is flat orange with dark text,
// secondary is transparent with a 1px `input` border, links are underlined.
// `destructive` is the quiet outline form; `destructive-solid` is the filled
// red CTA used by destructive AlertDialogs.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-bold whitespace-nowrap transition-colors duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_10%)]",
        outline:
          "border-input bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "border-input bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10",
        // Solid red CTA for confirming irreversible actions. Text uses
        // destructive-foreground (white in light, espresso in dark): white on
        // the dark-mode red is only 3.5:1, espresso on it is 5.5:1.
        "destructive-solid":
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40 dark:focus-visible:ring-destructive/60",
        link: "rounded-none px-0 text-primary-ink underline underline-offset-4 hover:decoration-2",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3.5 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto" }],
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
