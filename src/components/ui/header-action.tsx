"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Any link component that renders an anchor from `href` + anchor props:
 * a plain `"a"` (the default), Next.js `Link`, or your i18n library's link.
 */
export type HeaderActionLinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

type ConnectWalletProps = React.ComponentProps<typeof ConnectWallet>

export interface HeaderActionProps {
  /** The demo app's root, e.g. `/en/app`. The launch link points here. */
  appHref: string
  /**
   * Whether the visitor is inside the app. When omitted, it is derived
   * from `pathname`: the app root or any page under it.
   */
  inApp?: boolean
  /** Current pathname (e.g. `usePathname()`), used when `inApp` is omitted. */
  pathname?: string
  /** Text of the launch link. Default "Launch demo". */
  launchLabel?: React.ReactNode
  /** Link component for the launch link. Default: a plain `<a>`. */
  LinkComponent?: HeaderActionLinkComponent
  /** Called when the launch link is followed (e.g. to close a menu). */
  onNavigate?: () => void
  /**
   * Inside the app, render a pulsing placeholder the size of the wallet
   * control instead of it. Use it until the client store has hydrated, so
   * the server render and the first client render match.
   */
  loading?: boolean
  /** Props passed to `ConnectWallet` inside the app: status, address, handlers, labels. */
  wallet?: Omit<ConnectWalletProps, "className">
  className?: string
}

function isInApp(appHref: string, pathname: string | undefined) {
  if (!pathname) return false
  const root = appHref.split(/[?#]/)[0].replace(/\/$/, "")
  return pathname === root || pathname.startsWith(`${root}/`)
}

/**
 * The site header's one primary action: a "Launch demo" link on the
 * marketing pages, the connect-wallet control inside the demo app. Pass it
 * as `SiteHeader`'s `primaryAction`.
 */
function HeaderAction({
  appHref,
  inApp,
  pathname,
  launchLabel = "Launch demo",
  LinkComponent = "a",
  onNavigate,
  loading = false,
  wallet,
  className,
}: HeaderActionProps) {
  const insideApp = inApp ?? isInApp(appHref, pathname)

  if (!insideApp) {
    return (
      <Button asChild data-slot="header-action" className={className}>
        <LinkComponent href={appHref} onClick={onNavigate}>
          {launchLabel}
        </LinkComponent>
      </Button>
    )
  }

  if (loading) {
    return (
      <Skeleton
        aria-hidden="true"
        data-slot="header-action"
        data-loading=""
        className={cn("h-10 w-40 rounded-full", className)}
      />
    )
  }

  return (
    <ConnectWallet
      data-slot="header-action"
      {...wallet}
      className={cn("h-10", className)}
    />
  )
}

export { HeaderAction }
