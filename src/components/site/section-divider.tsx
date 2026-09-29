import { cn } from "@/lib/utils"

/** monark.io's branded separator: a thin flat orange line with an outlined circle at each end. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("mx-auto flex w-full max-w-6xl items-center px-4 sm:px-6", className)}>
      <span className="size-2.5 shrink-0 rounded-full border-2 border-primary" />
      <span className="h-px flex-1 bg-primary" />
      <span className="size-2.5 shrink-0 rounded-full border-2 border-primary" />
    </div>
  )
}
