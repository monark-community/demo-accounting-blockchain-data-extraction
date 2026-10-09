"use client"

import * as React from "react"
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "cn"

type TxStatusKind = "pending" | "confirmed" | "failed"

const statusConfig: Record<
  TxStatusKind,
  {
    icon: React.ComponentType<{ className?: string }>
    label: string
    tone: string
  }
> = {
  pending: {
    icon: Loader2Icon,
    label: "Pending",
    tone: "text-muted-foreground [&>svg]:animate-spin",
  },
  confirmed: {
    icon: CheckCircle2Icon,
    label: "Confirmed",
    tone: "text-success",
  },
  failed: {
    icon: XCircleIcon,
    label: "Failed",
    tone: "text-destructive",
  },
}

function truncateHash(hash: string, start = 8, end = 6) {
  if (hash.length <= start + end + 1) return hash
  return `${hash.slice(0, start)}…${hash.slice(-end)}`
}

function TxStatus({
  status,
  hash,
  label,
  explorerUrl,
  href,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  status: TxStatusKind
  hash: string
  label?: React.ReactNode
  explorerUrl?: string
  href?: string
}) {
  const config = statusConfig[status]
  const Icon = config.icon
  const finalHref =
    href ??
    (explorerUrl
      ? `${explorerUrl.replace(/\/$/, "")}/tx/${hash}`
      : undefined)

  return (
    <div
      data-slot="tx-status"
      data-status={status}
      className={cn(
        "inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border bg-card px-3 py-1.5 text-sm",
        className
      )}
      {...props}
    >
      <span className={cn("inline-flex items-center gap-1.5", config.tone)}>
        <Icon className="size-4" />
        <span className="font-bold">{label ?? config.label}</span>
      </span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      {finalHref ? (
        <a
          href={finalHref}
          target="_blank"
          rel="noopener noreferrer"
          title={hash}
          className="inline-flex items-center gap-1 rounded-sm font-mono text-xs text-muted-foreground tabular-nums underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {truncateHash(hash)}
          <ExternalLinkIcon className="size-3" />
        </a>
      ) : (
        <span
          title={hash}
          className="font-mono text-xs text-muted-foreground tabular-nums"
        >
          {truncateHash(hash)}
        </span>
      )}
    </div>
  )
}

export { TxStatus, truncateHash }
