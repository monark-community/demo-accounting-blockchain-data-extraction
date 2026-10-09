import * as React from "react"

import { cn } from "cn"

export interface DemoChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visible text. Default "Demo"; pass the translated word on other locales. */
  label?: React.ReactNode
  /**
   * Longer explanation, e.g. "Simulated demo: no real funds move". Shown
   * as a tooltip on hover and read by screen readers after the label.
   */
  description?: string
}

/**
 * Marks a whole site as a simulated demo: a pill with a small dot, tinted
 * with the primary at low opacity and `primary-ink` text. Sits first in
 * the site header's actions. Drop it once the product is live.
 *
 * The light tint stays at 8%: at 12px bold, primary-ink needs 4.5:1, and
 * a stronger tint drops it below that on the cream background.
 */
function DemoChip({
  label = "Demo",
  description,
  className,
  ...props
}: DemoChipProps) {
  return (
    <span
      data-slot="demo-chip"
      title={description}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs font-bold whitespace-nowrap text-primary-ink dark:bg-primary/15",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
      {description ? <span className="sr-only">: {description}</span> : null}
    </span>
  )
}

export { DemoChip }
