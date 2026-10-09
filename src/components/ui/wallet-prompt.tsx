"use client"

import * as React from "react"
import { Loader2Icon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  NetworkBadge,
  type NetworkStatus,
} from "@/components/ui/network-badge"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"

type WalletPromptStatus = "idle" | "signing"

type WalletPromptRow = {
  label: React.ReactNode
  value: React.ReactNode
}

type WalletPromptAccount = {
  name?: React.ReactNode
  address: string
}

/**
 * A simulated wallet's "confirm this transaction" sheet: what is being signed
 * (summary rows), on which network, for what fee, then Confirm or Reject.
 * Dismissing it (close button, Escape, outside click) counts as a rejection.
 * While `status="signing"` the actions are disabled and it can't be dismissed.
 */
function WalletPrompt({
  open,
  onOpenChange,
  title,
  description = "Confirm in your wallet",
  site,
  account,
  accountLabel,
  rows = [],
  network,
  networkStatus = "live",
  fee,
  noFee = false,
  disclaimer = "Simulated signature. Nothing leaves your browser.",
  warning = false,
  status = "idle",
  onConfirm,
  onReject,
  confirmLabel = "Confirm",
  rejectLabel = "Reject",
  signingLabel = "Confirming…",
  networkLabel = "Network",
  feeLabel = "Estimated network fee",
  noFeeLabel = "No fee",
  closeLabel = "Close",
  className,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "title" | "children"> & {
  open: boolean
  onOpenChange?: (open: boolean) => void
  /** The action being signed, e.g. "Fund bounty". Falls back to `description`. */
  title?: React.ReactNode
  /** Sub-heading under the title. */
  description?: React.ReactNode
  /** Small eyebrow above the title: the requesting site, a logo + domain. */
  site?: React.ReactNode
  /** The signing account, shown as an avatar card. */
  account?: WalletPromptAccount
  /** Caption above the account name, e.g. "Signing as". */
  accountLabel?: React.ReactNode
  rows?: WalletPromptRow[]
  /** Network name. The row is hidden when omitted. */
  network?: React.ReactNode
  networkStatus?: NetworkStatus
  /** Pre-formatted fee, e.g. "0.00042 tETH". */
  fee?: React.ReactNode
  /** The action costs no fee: shows `noFeeLabel` instead of `fee`. */
  noFee?: boolean
  /** One-line note under the summary. Pass null to hide it. */
  disclaimer?: React.ReactNode
  /** Shows the disclaimer with a warning icon (use when the action moves value). */
  warning?: boolean
  status?: WalletPromptStatus
  onConfirm?: () => void
  /** Called by the Reject button and when the prompt is dismissed. */
  onReject?: () => void
  confirmLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  signingLabel?: React.ReactNode
  networkLabel?: React.ReactNode
  feeLabel?: React.ReactNode
  noFeeLabel?: React.ReactNode
  closeLabel?: string
}) {
  const signing = status === "signing"
  const showFee = noFee || (fee !== undefined && fee !== null && fee !== "")

  const reject = () => {
    onReject?.()
    onOpenChange?.(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) onOpenChange?.(true)
        else if (!signing) reject()
      }}
    >
      <DialogContent
        data-slot="wallet-prompt"
        data-status={status}
        aria-busy={signing || undefined}
        showCloseButton={!signing}
        closeLabel={closeLabel}
        className={cn("gap-5 sm:max-w-md", className)}
        {...props}
      >
        <DialogHeader data-slot="wallet-prompt-header" className="gap-1 text-left">
          {site ? (
            <div
              data-slot="wallet-prompt-site"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground [&_img]:size-5 [&_svg]:size-5"
            >
              {site}
            </div>
          ) : null}
          <DialogTitle className={cn(site && "pt-2")}>
            {title ?? description}
          </DialogTitle>
          <DialogDescription className={cn(!title && "sr-only")}>
            {description}
          </DialogDescription>
        </DialogHeader>

        {account ? (
          <div
            data-slot="wallet-prompt-account"
            className="flex items-center gap-3 rounded-2xl border bg-muted/50 p-3"
          >
            <WalletAvatar address={account.address} size={32} />
            <div className="min-w-0 leading-tight">
              {accountLabel ? (
                <p className="text-xs text-muted-foreground">{accountLabel}</p>
              ) : null}
              {account.name ? (
                <p className="truncate text-sm font-bold">{account.name}</p>
              ) : null}
              <WalletAddress
                address={account.address}
                className="text-xs text-muted-foreground"
              />
            </div>
          </div>
        ) : null}

        {rows.length > 0 || network || showFee ? (
          <dl
            data-slot="wallet-prompt-summary"
            className="divide-y rounded-2xl border text-sm"
          >
            {rows.map((row, i) => (
              <div
                key={i}
                data-slot="wallet-prompt-row"
                className="flex items-start justify-between gap-4 px-4 py-2.5"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-semibold">{row.value}</dd>
              </div>
            ))}
            {network ? (
              <div
                data-slot="wallet-prompt-network"
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <dt className="text-muted-foreground">{networkLabel}</dt>
                <dd>
                  <NetworkBadge
                    name={network}
                    status={networkStatus}
                    variant="outline"
                  />
                </dd>
              </div>
            ) : null}
            {showFee ? (
              <div
                data-slot="wallet-prompt-fee"
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <dt className="text-muted-foreground">{feeLabel}</dt>
                <dd className={cn(noFee ? "font-semibold" : "font-mono text-xs")}>
                  {noFee ? noFeeLabel : fee}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {disclaimer ? (
          <p
            data-slot="wallet-prompt-disclaimer"
            className="flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            {warning ? (
              <TriangleAlertIcon
                aria-hidden="true"
                className="mt-px size-3.5 shrink-0 text-warning"
              />
            ) : null}
            <span>{disclaimer}</span>
          </p>
        ) : null}

        <DialogFooter data-slot="wallet-prompt-actions" className="pt-0">
          <Button
            variant="outline"
            size="lg"
            disabled={signing}
            onClick={reject}
          >
            {rejectLabel}
          </Button>
          <Button size="lg" disabled={signing} onClick={onConfirm} autoFocus>
            {signing ? (
              <>
                <Loader2Icon aria-hidden="true" className="animate-spin" />
                {signingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { WalletPrompt }
export type { WalletPromptAccount, WalletPromptRow, WalletPromptStatus }
