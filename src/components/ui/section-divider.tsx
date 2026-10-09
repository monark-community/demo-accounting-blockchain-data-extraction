import * as React from "react"
import { cn } from "cn"

type Ends = "both" | "start" | "end" | "none"

function Ring() {
  return (
    <span
      data-slot="section-divider-ring"
      className="size-2.5 shrink-0 rounded-full border-2 border-primary"
    />
  )
}

/**
 * monark.io's branded separator: a thin flat orange line with an outlined
 * ring at each end. Decorative by default (aria-hidden); pass
 * `decorative={false}` to expose it as a `separator` to assistive tech.
 * `contained` centres it in the standard max-w-6xl page gutter, as the demo
 * sites place it between landing sections.
 */
function SectionDivider({
  className,
  orientation = "horizontal",
  ends = "both",
  contained = false,
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  /** Which ends get a ring. */
  ends?: Ends
  contained?: boolean
  decorative?: boolean
}) {
  const vertical = orientation === "vertical"
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "separator", "aria-orientation": orientation } as const)

  return (
    <div
      data-slot="section-divider"
      data-orientation={orientation}
      {...a11y}
      className={cn(
        "flex items-center",
        vertical ? "h-full min-h-8 flex-col" : "w-full",
        contained && !vertical && "mx-auto max-w-6xl px-4 sm:px-6",
        className
      )}
      {...props}
    >
      {(ends === "both" || ends === "start") && <Ring />}
      <span
        data-slot="section-divider-line"
        className={cn("min-h-0 min-w-0 flex-1 bg-primary", vertical ? "w-px" : "h-px")}
      />
      {(ends === "both" || ends === "end") && <Ring />}
    </div>
  )
}

export { SectionDivider }
export type { Ends as SectionDividerEnds }
