import { cn } from "@/lib/utils"

/** The header's Demo chip (brand guidelines §10): marks the site as a simulated demo. */
export function DemoChip({ label, title, className }: { label: string; title: string; className?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-primary/8 px-2.5 text-xs font-bold text-primary-ink dark:bg-primary/15",
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
      {label}
      <span className="sr-only">: {title}</span>
    </span>
  )
}
