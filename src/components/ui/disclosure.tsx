"use client"

import * as React from "react"
import { cn } from "cn"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

// Context on demand: secondary detail (worked examples, on-chain fields, the
// maths behind a number) folded behind a "show details" row.
// `variant="card"` is a bordered card whose whole header row toggles and
// whose content sits under a divider; `variant="pill"` is an inline pill
// button with the content revealed below it.
function Disclosure({
  className,
  variant = "card",
  summary,
  icon,
  children,
  contentClassName,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "children"> & {
  variant?: "card" | "pill"
  /** The always-visible label of the toggle row. */
  summary: React.ReactNode
  /** Optional leading icon in the toggle row. */
  icon?: React.ReactNode
  children?: React.ReactNode
  /** Classes for the revealed content wrapper. */
  contentClassName?: string
}) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="disclosure"
      data-variant={variant}
      className={cn(
        "group/disclosure",
        variant === "card" && "rounded-2xl border bg-card",
        className
      )}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        data-slot="disclosure-trigger"
        className={cn(
          "group/disclosure-trigger flex min-h-11 cursor-pointer items-center gap-2 text-left text-sm font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          variant === "card"
            ? "w-full justify-between rounded-2xl px-4 py-2.5 hover:bg-muted group-data-[state=open]/disclosure:rounded-b-none"
            : "w-fit rounded-full border px-4 hover:bg-muted focus-visible:border-ring"
        )}
      >
        <span
          data-slot="disclosure-summary"
          className="inline-flex min-w-0 items-center gap-2"
        >
          {icon ? (
            <span
              data-slot="disclosure-icon"
              aria-hidden="true"
              className="inline-flex text-primary-ink"
            >
              {icon}
            </span>
          ) : null}
          {summary}
        </span>
        <ChevronDownIcon
          data-slot="disclosure-chevron"
          aria-hidden="true"
          className="text-muted-foreground transition-transform duration-200 group-data-[state=open]/disclosure-trigger:rotate-180 motion-reduce:transition-none"
        />
      </CollapsiblePrimitive.Trigger>
      {/* The animated element carries no padding or margin, so the height
          animation runs from 0 without a jump; spacing lives on the inner div. */}
      <CollapsiblePrimitive.Content
        data-slot="disclosure-content"
        className="animate-expand"
      >
        <div
          className={cn(
            "text-sm",
            variant === "card" ? "border-t px-4 py-3" : "pt-4",
            contentClassName
          )}
        >
          {children}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { Disclosure }
