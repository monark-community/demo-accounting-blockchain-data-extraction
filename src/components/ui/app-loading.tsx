import * as React from "react"
import { cn } from "cn"

import { Skeleton } from "@/components/ui/skeleton"

const STAT_COLUMNS: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
}

export interface AppLoadingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Screen-reader text, e.g. "Loading your books…". */
  label?: string
  /** Number of stat tiles in the first row (0 to 4). Default 4. */
  stats?: number
  /** Number of full-width panels under the stats. Default 2. */
  panels?: number
  /**
   * A custom skeleton for screens that don't fit the stats-and-panels
   * shape. Replaces the title, stats and panels; the status wrapper and
   * the label stay.
   */
  children?: React.ReactNode
}

/**
 * The demo app's loading skeleton, shown until the client store has
 * hydrated: a title pill, a row of stat tiles and full-width panels,
 * wrapped in a polite status region that announces `label`.
 */
function AppLoading({
  label = "Loading the demo…",
  stats = 4,
  panels = 2,
  children,
  className,
  ...props
}: AppLoadingProps) {
  const statCount = Math.max(0, Math.min(4, Math.floor(stats)))
  const panelCount = Math.max(0, Math.floor(panels))

  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="app-loading"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {children ?? (
        <>
          <Skeleton data-slot="app-loading-title" className="h-9 w-56 rounded-full" />
          {statCount > 0 ? (
            <div
              data-slot="app-loading-stats"
              className={cn("grid gap-3", STAT_COLUMNS[statCount])}
            >
              {Array.from({ length: statCount }, (_, i) => (
                <Skeleton key={i} data-slot="app-loading-stat" className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : null}
          {Array.from({ length: panelCount }, (_, i) => (
            <Skeleton key={i} data-slot="app-loading-panel" className="h-40 rounded-2xl" />
          ))}
        </>
      )}
    </div>
  )
}

export { AppLoading }
