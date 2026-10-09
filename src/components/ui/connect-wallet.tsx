"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  Loader2Icon,
  LogOutIcon,
  Wallet as WalletIcon,
} from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"

type ConnectWalletStatus = "disconnected" | "connecting" | "connected"

function ConnectWallet({
  status = "disconnected",
  address,
  name,
  onConnect,
  onDisconnect,
  connectLabel = "Connect wallet",
  connectingLabel = "Connecting…",
  disconnectLabel = "Disconnect",
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children" | "disabled"
> & {
  status?: ConnectWalletStatus
  address?: string
  name?: string
  onConnect?: () => void
  onDisconnect?: () => void
  connectLabel?: React.ReactNode
  connectingLabel?: React.ReactNode
  disconnectLabel?: React.ReactNode
}) {
  if (status === "connecting") {
    return (
      <Button disabled className={className} {...props}>
        <Loader2Icon className="animate-spin" />
        {connectingLabel}
      </Button>
    )
  }

  if (status === "connected" && address) {
    // Button-only props have no meaning on the plain trigger; the rest (data-*,
    // aria-*, id) still reach the DOM.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant, size, asChild, ...triggerProps } = props
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-slot="connect-wallet-trigger"
            {...triggerProps}
            className={cn(
              "inline-flex h-10 max-w-full items-center gap-2.5 rounded-full border bg-card p-1 pr-3 text-card-foreground outline-hidden transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted",
              className
            )}
          >
            <WalletAvatar address={address} size={30} />
            <div className="flex min-w-0 flex-col text-left leading-tight">
              {name && (
                <span className="truncate text-sm font-bold">{name}</span>
              )}
              <WalletAddress
                address={address}
                className={cn(
                  "text-muted-foreground",
                  name ? "text-xs" : "text-sm"
                )}
              />
            </div>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onDisconnect}>
            <LogOutIcon />
            {disconnectLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={onConnect} className={className} {...props}>
      <WalletIcon />
      {connectLabel}
    </Button>
  )
}

export { ConnectWallet }
export type { ConnectWalletStatus }
