"use client"

import * as React from "react"
import { InfoIcon } from "lucide-react"
import { cn } from "cn"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Context on demand: a round "i" button that opens a small popover on click,
 * tap or Enter/Space. Use it instead of a hint paragraph next to a label or
 * figure. It is a popover rather than a tooltip so it works on touch screens
 * and can hold a link.
 */
function InfoTip({
  label = "More information",
  children,
  icon,
  className,
  contentClassName,
  side,
  align = "center",
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** Accessible name of the trigger button, e.g. "How fees work". */
  label?: string
  /** Popover content. */
  children: React.ReactNode
  /** Replaces the default info icon. Rendered aria-hidden. */
  icon?: React.ReactNode
  /** Classes for the popover panel. `className` styles the trigger. */
  contentClassName?: string
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="info-tip"
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted aria-expanded:text-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            className
          )}
          {...props}
        >
          <span aria-hidden="true" className="contents">
            {icon ?? <InfoIcon />}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="info-tip-content"
        side={side}
        align={align}
        sideOffset={6}
        collisionPadding={16}
        className={cn(
          "w-auto max-w-72 gap-2 rounded-2xl p-3.5 text-sm font-normal",
          contentClassName
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export { InfoTip }
