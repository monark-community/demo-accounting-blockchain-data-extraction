import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"

const networkBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        subtle: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const statusDot = {
  live: "bg-success",
  degraded: "bg-warning",
  down: "bg-destructive",
} as const

type NetworkStatus = keyof typeof statusDot

function NetworkBadge({
  name,
  icon,
  status,
  variant,
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> &
  VariantProps<typeof networkBadgeVariants> & {
    name: React.ReactNode
    icon?: React.ReactNode
    /**
     * Shows a coloured status dot when there is no `icon`. The colour is
     * decorative: say the state in `name` or a tooltip if it matters.
     */
    status?: NetworkStatus
  }) {
  const indicator =
    icon ??
    (status ? (
      <span className={cn("block rounded-full", statusDot[status])} />
    ) : null)

  return (
    <span
      data-slot="network-badge"
      className={cn(networkBadgeVariants({ variant }), className)}
      {...props}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-full [&>*]:size-full"
        >
          {indicator}
        </span>
      )}
      <span>{name}</span>
    </span>
  )
}

export { NetworkBadge, networkBadgeVariants }
export type { NetworkStatus }
