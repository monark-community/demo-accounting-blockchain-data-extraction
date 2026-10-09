"use client"

import * as React from "react"
import { cn } from "cn"
import { MenuIcon, XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"

/**
 * Any link component that renders an anchor from `href` + anchor props:
 * a plain `"a"` (the default), Next.js `Link`, or your i18n library's link.
 */
export type SiteHeaderLinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface SiteNavLink {
  href: string
  label: React.ReactNode
  /**
   * Only mark the link active on an exact pathname match. Set it on the
   * home link (`/` or a locale root such as `/fr`), which would otherwise
   * match every page.
   */
  exact?: boolean
}

export interface SiteHeaderLabels {
  /** Accessible name of the links `<nav>`. Default "Main". */
  nav?: string
  /** Menu button's accessible name. Default "Open menu". */
  openMenu?: string
  /** Sheet close button's accessible name. Default "Close menu". */
  closeMenu?: string
  /** Sheet title. Default "Menu". */
  menu?: string
}

function isLinkActive(link: SiteNavLink, pathname: string | undefined) {
  if (!pathname) return false
  const href = link.href.split(/[?#]/)[0] || "/"
  if (pathname === href) return true
  if (link.exact || href === "/") return false
  return pathname.startsWith(href.endsWith("/") ? href : `${href}/`)
}

export interface SiteNavLinksProps {
  links: SiteNavLink[]
  pathname?: string
  LinkComponent?: SiteHeaderLinkComponent
  className?: string
  itemClassName?: string
}

/**
 * The site's own page links: Nunito Sans 600 at 14px in `muted-foreground`,
 * the current page in `foreground` with `aria-current="page"`.
 */
function SiteNavLinks({
  links,
  pathname,
  LinkComponent = "a",
  className,
  itemClassName,
}: SiteNavLinksProps) {
  return (
    <ul data-slot="site-nav-links" className={cn("flex items-center gap-1.5", className)}>
      {links.map((link) => {
        const active = isLinkActive(link, pathname)
        return (
          <li key={link.href}>
            <LinkComponent
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-md px-2 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                itemClassName
              )}
            >
              {link.label}
            </LinkComponent>
          </li>
        )
      })}
    </ul>
  )
}

export interface SiteHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Left slot: the product brand, usually `<SiteBrand />`. */
  brand: React.ReactNode
  /** Up to four links to the site's own pages, shown 28px after the brand. */
  links?: SiteNavLink[]
  /** Current pathname, used to mark the active link (e.g. `usePathname()`). */
  pathname?: string
  /** Link component for the page links. Default: a plain `<a>`. */
  LinkComponent?: SiteHeaderLinkComponent
  /**
   * Right slot, in this order: `<DemoChip />`, `<LocaleSwitch />`,
   * `<ThemeToggle />`, then one primary action.
   */
  actions?: React.ReactNode
  /**
   * What the mobile sheet shows under the links. Defaults to `actions`.
   * A `<DemoChip />` among them stays left and the rest go right.
   */
  mobileActions?: React.ReactNode
  /**
   * The one primary action (Launch demo, ConnectWallet). Shown last in
   * the desktop actions and full width at the bottom of the mobile sheet.
   */
  primaryAction?: React.ReactNode
  labels?: SiteHeaderLabels
  /** Classes for the inner row (max width, side padding). */
  containerClassName?: string
}

/**
 * The standard Monark site header: sticky, 64px, translucent background
 * with a blur and a bottom border. Desktop (`lg` and up): brand, links,
 * then the actions pushed right. Below `lg`: the brand and a menu button
 * that opens a full-height sheet with the links and the actions.
 */
function SiteHeader({
  brand,
  links = [],
  pathname,
  LinkComponent = "a",
  actions,
  mobileActions,
  primaryAction,
  labels,
  className,
  containerClassName,
  ...props
}: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false)
  const navLabel = labels?.nav ?? "Main"
  const menuLabel = labels?.menu ?? "Menu"
  const sheetActions = mobileActions ?? actions

  // Close the sheet after a navigation, however it happened.
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close the sheet when a link inside it is followed (covers links passed
  // in `actions`, too, and same-page links that don't change the pathname).
  function closeOnLinkClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as Element | null
    if (target?.closest("a[href]")) setOpen(false)
  }

  return (
    <header
      data-slot="site-header"
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background supports-[backdrop-filter]:bg-background/90 supports-[backdrop-filter]:backdrop-blur-md",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6",
          containerClassName
        )}
      >
        {brand}

        {links.length > 0 ? (
          // 28px after the brand: 20px margin + each link's own 8px padding.
          <nav aria-label={navLabel} className="ml-5 hidden lg:block">
            <SiteNavLinks links={links} pathname={pathname} LinkComponent={LinkComponent} />
          </nav>
        ) : null}

        {actions || primaryAction ? (
          <div data-slot="site-header-actions" className="ml-auto hidden items-center gap-2.5 lg:flex">
            {actions}
            {primaryAction}
          </div>
        ) : null}

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={labels?.openMenu ?? "Open menu"}
              className="ml-auto size-9 rounded-full lg:hidden [&_svg]:size-5"
            >
              <MenuIcon aria-hidden="true" />
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none lg:hidden" />
            <DialogPrimitive.Content
              data-slot="site-header-sheet"
              onClick={closeOnLinkClick}
              className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l bg-background shadow-lg duration-200 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-10 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-10 motion-reduce:animate-none lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-5">
                <DialogPrimitive.Title className="text-base font-extrabold text-foreground">
                  {menuLabel}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">{navLabel}</DialogPrimitive.Description>
                <DialogPrimitive.Close asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={labels?.closeMenu ?? "Close menu"}
                    className="-mr-2 size-11 rounded-full [&_svg]:size-5"
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </DialogPrimitive.Close>
              </div>
              {links.length > 0 ? (
                <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3 py-4">
                  <SiteNavLinks
                    links={links}
                    pathname={pathname}
                    LinkComponent={LinkComponent}
                    className="flex-col items-stretch gap-1"
                    itemClassName="h-12 w-full px-4 text-base hover:bg-secondary aria-[current=page]:bg-secondary"
                  />
                </nav>
              ) : (
                <div className="flex-1" />
              )}
              {sheetActions || primaryAction ? (
                <div
                  data-slot="site-header-sheet-actions"
                  className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
                >
                  {sheetActions ? (
                    <div className="flex flex-wrap items-center justify-end gap-2.5 *:data-[slot=demo-chip]:mr-auto *:data-[slot=theme-toggle]:size-11">
                      {sheetActions}
                    </div>
                  ) : null}
                  {primaryAction ? (
                    <div className="flex *:h-12 *:w-full *:justify-center">
                      {primaryAction}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </header>
  )
}

export { SiteHeader, SiteNavLinks }
