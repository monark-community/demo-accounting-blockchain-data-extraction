"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

export interface WalletLabels {
  connect: string
  connecting: string
  disconnect: string
  signIn: string
  signInRow: string
  signInValue: string
}

/**
 * The header's one primary action: "Launch demo" on marketing pages, the
 * connect-wallet control inside the demo app.
 */
export function HeaderAction({
  appHref,
  launchLabel,
  wallet,
  className,
  onNavigate,
}: {
  appHref: string
  launchLabel: string
  wallet: WalletLabels
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  const inApp = pathname === appHref || pathname.startsWith(`${appHref}/`)
  const demo = useDemo()

  if (!inApp) {
    return (
      <Button asChild className={className}>
        <Link href={appHref} onClick={onNavigate}>
          {launchLabel}
        </Link>
      </Button>
    )
  }

  if (!demo) {
    return <div aria-hidden="true" className={cn("h-10 w-40 animate-pulse rounded-full bg-muted", className)} />
  }

  return (
    <ConnectWallet
      status={demo.wallet.status}
      address={demo.wallet.address}
      name={demo.wallet.name}
      connectLabel={wallet.connect}
      connectingLabel={wallet.connecting}
      disconnectLabel={wallet.disconnect}
      onConnect={() =>
        void connectWallet({
          title: wallet.signIn,
          rows: [{ label: wallet.signInRow, value: wallet.signInValue }],
          movesValue: false,
          noFee: true,
        })
      }
      onDisconnect={disconnectWallet}
      className={cn("h-10", className)}
    />
  )
}
