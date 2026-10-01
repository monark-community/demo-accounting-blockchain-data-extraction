import { TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** "Testnet demo · not financial advice · no real funds": shown once per transaction, in the wallet prompt only (guidelines §11). */
export function Disclaimer({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-xs text-muted-foreground", className)}>
      <TriangleAlertIcon className="mt-px size-3.5 shrink-0 text-warning" aria-hidden="true" />
      <span>{text}</span>
    </p>
  )
}
