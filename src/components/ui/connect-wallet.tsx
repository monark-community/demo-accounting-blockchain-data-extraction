"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  Loader2Icon,
  LogOutIcon,
  Wallet as WalletIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
        <Loader2Icon className="size-4 animate-spin" />
        {connectingLabel}
      </Button>
    )
  }

  if (status === "connected" && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-slot="connect-wallet-trigger"
            className={cn(
              "inline-flex items-center gap-2.5 rounded-full border bg-card p-1 pr-3 text-card-foreground outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
            <LogOutIcon className="size-4" />
            {disconnectLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={onConnect} className={className} {...props}>
      <WalletIcon className="size-4" />
      {connectLabel}
    </Button>
  )
}

export { ConnectWallet }
export type { ConnectWalletStatus }
