import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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

function NetworkBadge({
  name,
  icon,
  variant,
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> &
  VariantProps<typeof networkBadgeVariants> & {
    name: React.ReactNode
    icon?: React.ReactNode
  }) {
  return (
    <span
      data-slot="network-badge"
      className={cn(networkBadgeVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-full [&>*]:size-full"
        >
          {icon}
        </span>
      )}
      <span>{name}</span>
    </span>
  )
}

export { NetworkBadge, networkBadgeVariants }
