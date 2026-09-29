import { kindOf } from "@/lib/demo/classify"
import type { CategoryId } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

const DOT: Record<string, string> = {
  income: "bg-success",
  expense: "bg-chart-3",
  neutral: "bg-muted-foreground",
  fees: "bg-muted-foreground",
  review: "bg-warning",
}

/** A category as a small pill: coloured dot + label (colour is never the only signal). */
export function CategoryChip({ category, label, className }: { category: CategoryId; label: string; className?: string }) {
  const kind = kindOf(category)
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        kind === "review" ? "border-warning/40 bg-warning/10 text-warning" : "bg-card text-foreground",
        className
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", DOT[kind])} />
      <span className="truncate">{label}</span>
    </span>
  )
}
