"use client"

import * as React from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function truncateAddress(address: string, start = 6, end = 4) {
  if (address.length <= start + end + 1) return address
  return `${address.slice(0, start)}…${address.slice(-end)}`
}

const avatarPx = { sm: 24, md: 32, lg: 40 } as const
const nameText = { sm: "text-xs", md: "text-sm", lg: "text-base" } as const

type WalletSize = keyof typeof avatarPx

function Wallet({
  address,
  name,
  size = "md",
  showCopy = true,
  copyLabel,
  copiedLabel,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  address: string
  name?: string
  size?: WalletSize
  showCopy?: boolean
  copyLabel?: string
  copiedLabel?: string
}) {
  return (
    <div
      data-slot="wallet"
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-full border bg-card p-1 pr-2 text-card-foreground",
        className
      )}
      {...props}
    >
      <WalletAvatar address={address} size={avatarPx[size]} />
      <div className="flex min-w-0 flex-col leading-tight">
        {name && (
          <span className={cn("truncate font-bold", nameText[size])}>
            {name}
          </span>
        )}
        <WalletAddress
          address={address}
          className={cn(
            "text-muted-foreground",
            name ? "text-xs" : nameText[size]
          )}
        />
      </div>
      {showCopy && <WalletCopyButton address={address} copyLabel={copyLabel} copiedLabel={copiedLabel} />}
    </div>
  )
}

function WalletAvatar({
  address,
  size = 32,
  className,
  style,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  address: string
  size?: number
}) {
  return (
    <div
      data-slot="wallet-avatar"
      aria-hidden="true"
      className={cn("shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
    </div>
  )
}

function WalletAddress({
  address,
  start = 6,
  end = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  address: string
  start?: number
  end?: number
}) {
  return (
    <span
      data-slot="wallet-address"
      className={cn("font-mono tabular-nums", className)}
      title={address}
      {...props}
    >
      {truncateAddress(address, start, end)}
    </span>
  )
}

function WalletCopyButton({
  address,
  className,
  copyLabel = "Copy address",
  copiedLabel = "Address copied",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "onClick"> & {
  address: string
  copyLabel?: string
  copiedLabel?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = React.useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      const id = window.setTimeout(() => setCopied(false), 1500)
      return () => window.clearTimeout(id)
    })
  }, [address])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onCopy}
      aria-label={copied ? copiedLabel : copyLabel}
      className={cn("size-7", className)}
      {...props}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </Button>
  )
}

export { Wallet, WalletAvatar, WalletAddress, WalletCopyButton }
