"use client"

import * as React from "react"
import {
  Loader2Icon,
  RotateCcwIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"

type TxFeedbackPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"

/**
 * Why a transaction failed. The built-in keys have English default reasons;
 * any other key (e.g. "slippage") reads from `reasons`, else falls back to
 * the "reverted" reason.
 */
type TxFeedbackError = "rejected" | "reverted" | "expired" | (string & {})

const defaultReasons: Record<string, string> = {
  rejected: "You rejected it in your wallet. Nothing was sent.",
  reverted: "It failed on the network. Nothing changed.",
  expired: "It expired before it was confirmed. Nothing changed.",
}

/**
 * One transaction's visible lifecycle, inline next to the action that started
 * it: signing (waiting on the wallet) -> pending (hash) -> confirmed, or failed
 * with a plain-language reason, a retry and a dismiss. Renders nothing when idle.
 */
function TxFeedback({
  phase,
  hash,
  error = "reverted",
  reason,
  explorerUrl,
  href,
  hideConfirmed = false,
  onRetry,
  onDismiss,
  signingLabel = "Waiting for your confirmation in the wallet…",
  pendingLabel = "Waiting for the network…",
  pendingStatusLabel = "Pending",
  confirmedLabel = "Confirmed",
  failedLabel = "Failed",
  reasons,
  retryLabel = "Try again",
  dismissLabel = "Dismiss",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  phase: TxFeedbackPhase
  /** The transaction hash, once broadcast. */
  hash?: string
  /** Picks the default failure reason. */
  error?: TxFeedbackError
  /** Replaces the failure reason entirely. */
  reason?: React.ReactNode
  /** Block explorer base URL, passed to TxStatus (links `{url}/tx/{hash}`). */
  explorerUrl?: string
  /** Explicit explorer link, passed to TxStatus. */
  href?: string
  /** Render nothing once confirmed (the UI already shows the result). */
  hideConfirmed?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  signingLabel?: React.ReactNode
  /** The line above the pending TxStatus. */
  pendingLabel?: React.ReactNode
  /** The pending TxStatus pill label. */
  pendingStatusLabel?: React.ReactNode
  confirmedLabel?: React.ReactNode
  failedLabel?: React.ReactNode
  /** Translated or custom failure reasons, keyed by `error`. */
  reasons?: Partial<Record<TxFeedbackError, React.ReactNode>>
  retryLabel?: React.ReactNode
  dismissLabel?: React.ReactNode
}) {
  if (phase === "idle") return null
  if (phase === "confirmed" && (hideConfirmed || !hash)) return null

  const failReason =
    reason ??
    reasons?.[error] ??
    defaultReasons[error] ??
    reasons?.reverted ??
    defaultReasons.reverted

  return (
    <div
      data-slot="tx-feedback"
      data-phase={phase}
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-start gap-2", className)}
      {...props}
    >
      {phase === "signing" ? (
        <p
          data-slot="tx-feedback-message"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <WalletIcon className="size-4 text-primary" aria-hidden="true" />
          {signingLabel}
        </p>
      ) : null}

      {phase === "pending" ? (
        <div className="flex flex-col items-start gap-1.5">
          <p
            data-slot="tx-feedback-message"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <Loader2Icon
              className="size-4 animate-spin text-primary"
              aria-hidden="true"
            />
            {pendingLabel}
          </p>
          {hash ? (
            <TxStatus
              status="pending"
              hash={hash}
              label={pendingStatusLabel}
              explorerUrl={explorerUrl}
              href={href}
            />
          ) : null}
        </div>
      ) : null}

      {phase === "confirmed" && hash ? (
        <TxStatus
          status="confirmed"
          hash={hash}
          label={confirmedLabel}
          explorerUrl={explorerUrl}
          href={href}
        />
      ) : null}

      {phase === "failed" ? (
        <div
          data-slot="tx-feedback-error"
          role="alert"
          className="flex w-full flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-3.5"
        >
          <p className="flex items-start gap-2 text-sm">
            <XCircleIcon
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>
              <span className="font-bold text-destructive">{failedLabel}. </span>
              {failReason}
            </span>
          </p>
          {hash ? (
            <TxStatus
              status="failed"
              hash={hash}
              label={failedLabel}
              explorerUrl={explorerUrl}
              href={href}
              className="self-start"
            />
          ) : null}
          {onRetry || onDismiss ? (
            <div data-slot="tx-feedback-actions" className="flex flex-wrap gap-2">
              {onRetry ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RotateCcwIcon aria-hidden="true" />
                  {retryLabel}
                </Button>
              ) : null}
              {onDismiss ? (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {dismissLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { TxFeedback }
export type { TxFeedbackError, TxFeedbackPhase }
