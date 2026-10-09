"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Any link component that renders an anchor from `href` + anchor props:
 * a plain `"a"` (the default), Next.js `Link`, or your i18n library's link.
 */
export type AppTabsLinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface AppTab {
  href: string
  label: React.ReactNode
  /**
   * Only mark the tab active on an exact pathname match. Set it on the
   * app's root tab (`/en/app`), which would otherwise match every app page.
   */
  exact?: boolean
  /** Override the pathname match, for tabs that own several unrelated routes. */
  active?: boolean
  /** Small leading icon (lucide), sized to 16px. */
  icon?: React.ReactNode
  /** Only show the icon from `sm` up (labels stay on all sizes). */
  iconDesktopOnly?: boolean
  /** Badge count shown after the label, e.g. items waiting on the user. Hidden at 0. */
  count?: number
  /** Screen-reader text for the count, e.g. "3 waiting on you". Defaults to the number. */
  countLabel?: string
}

function isTabActive(tab: AppTab, pathname: string | undefined) {
  if (tab.active !== undefined) return tab.active
  if (!pathname) return false
  const href = tab.href.split(/[?#]/)[0] || "/"
  if (pathname === href) return true
  if (tab.exact || href === "/") return false
  return pathname.startsWith(href.endsWith("/") ? href : `${href}/`)
}

export interface AppTabLinksProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  tabs: AppTab[]
  /** Current pathname, used to mark the active tab (e.g. `usePathname()`). */
  pathname?: string
  /** Link component for the tabs. Default: a plain `<a>`. */
  LinkComponent?: AppTabsLinkComponent
  /** Accessible name of the `<nav>`. Default "App sections". */
  label?: string
}

/**
 * The tab links on their own: a labelled `<nav>` with a horizontally
 * scrollable row of pill links. The current tab gets a card background, a
 * hairline ring and `aria-current="page"`, and is scrolled into view.
 */
function AppTabLinks({
  tabs,
  pathname,
  LinkComponent = "a",
  label = "App sections",
  className,
  ...props
}: AppTabLinksProps) {
  const listRef = React.useRef<HTMLUListElement>(null)
  const activeIndex = tabs.findIndex((tab) => isTabActive(tab, pathname))

  // Keep the current tab visible when the row overflows (phones). Scrolls
  // the row only, never the page.
  React.useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !current) return
    const row = list.getBoundingClientRect()
    const tab = current.getBoundingClientRect()
    if (tab.left < row.left) list.scrollLeft += tab.left - row.left - 8
    else if (tab.right > row.right) list.scrollLeft += tab.right - row.right + 8
  }, [activeIndex])

  return (
    <nav
      aria-label={label}
      data-slot="app-tabs-nav"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    >
      <ul
        ref={listRef}
        data-slot="app-tabs-list"
        className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => {
          const active = index === activeIndex || (tab.active ?? false)
          return (
            <li key={tab.href} className="shrink-0">
              <LinkComponent
                href={tab.href}
                aria-current={active ? "page" : undefined}
                data-slot="app-tab"
                data-active={active ? "" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-2 sm:px-3.5",
                  active
                    ? "bg-card text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon ? (
                  <span
                    aria-hidden="true"
                    data-slot="app-tab-icon"
                    className={cn(
                      "inline-flex shrink-0 [&_svg]:size-4",
                      tab.iconDesktopOnly && "hidden sm:inline-flex"
                    )}
                  >
                    {tab.icon}
                  </span>
                ) : null}
                {tab.label}
                {/* A space so the accessible name reads "Ledger (3 to review)"; flex drops it visually. */}
                {tab.count ? " " : null}
                {tab.count ? (
                  <span
                    data-slot="app-tab-count"
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums"
                  >
                    {tab.countLabel ? (
                      <>
                        <span aria-hidden="true">{tab.count}</span>
                        <span className="sr-only">({tab.countLabel})</span>
                      </>
                    ) : (
                      tab.count
                    )}
                  </span>
                ) : null}
              </LinkComponent>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export interface AppTabsProps extends AppTabLinksProps {
  /**
   * Right slot: the app's own controls (network pill, demo controls, a
   * "New" button). Stays visible while the tabs scroll.
   */
  actions?: React.ReactNode
  /** Classes for the inner row (max width, side padding). */
  containerClassName?: string
}

/**
 * The demo app's sub-bar, under the site header: a full-width strip with a
 * bottom border and a light secondary tint, the section tabs on the left
 * and `actions` on the right.
 */
function AppTabs({
  actions,
  containerClassName,
  className,
  ...props
}: AppTabsProps) {
  return (
    <div data-slot="app-tabs" className={cn("border-b bg-secondary/40", className)}>
      <div
        className={cn(
          "mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6",
          containerClassName
        )}
      >
        <AppTabLinks {...props} />
        {actions ? (
          <div data-slot="app-tabs-actions" className="flex shrink-0 items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { AppTabs, AppTabLinks }
