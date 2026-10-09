import * as React from "react"
import { cn } from "cn"

import { MonarkLogo } from "@/components/ui/site-brand"

/**
 * Any link component that renders an anchor from `href` + anchor props:
 * a plain `"a"` (the default), Next.js `Link`, or your i18n library's link.
 */
export type SiteFooterLinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface SiteFooterLink {
  href: string
  label: React.ReactNode
}

export interface SiteFooterSocial {
  /** Stable key, e.g. "github". */
  key: string
  href: string
  /** Accessible name and tooltip, e.g. "Monark on GitHub". */
  label: string
  /** 24px icon drawn in `currentColor`. */
  icon: React.ReactNode
}

export interface SiteFooterLabels {
  /** Accessible name of the product links `<nav>`. Default "Site pages". */
  productNav?: string
  /** Line above the Monark logo. Default "Built by Monark". */
  builtBy?: React.ReactNode
  /** Accessible name of the Monark logo link. Default "Monark home page". */
  monarkHome?: string
  /** Line under the Monark logo. Default "Fostering Collaboration within the Web3 Community". */
  tagline?: React.ReactNode
  /** Accessible name of the social links list. Default "Monark on social media". */
  socials?: string
}

const iconProps = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-6",
} as const

/** Monark's own social icons from the brand kit, redrawn in `currentColor`. */
const SOCIAL_ICONS = {
  discord: (
    <svg viewBox="0 0 24 25" {...iconProps}>
      <path d="M5.4563 15.9102C6.78005 16.9114 8.7788 17.9577 12 17.9577C15.2213 17.9577 17.22 16.9114 18.5438 15.9102" />
      <path d="M18 9.16391C16.3838 8.33891 14.7862 7.56641 12 7.56641C9.21375 7.56641 7.62375 8.34641 6 9.16391" />
      <path d="M10.245 7.68225L9.54375 6.30225C8.06167 6.48026 6.65225 7.04403 5.45625 7.93725C5.45625 7.93725 3.375 10.971 3 16.9372C5.11125 19.371 8.3175 19.3897 8.3175 19.3897L9.5625 17.721" />
      <path d="M14.4374 17.721L15.6824 19.3785C15.6824 19.3785 18.8887 19.371 20.9999 16.9372C20.6249 10.9747 18.5437 7.93725 18.5437 7.93725C18.5437 7.93725 16.6687 6.46725 14.4562 6.30225L13.7737 7.686" />
      <path d="M9.34119 15.2988C10.1323 15.2988 10.7737 14.5668 10.7737 13.6638C10.7737 12.7608 10.1323 12.0288 9.34119 12.0288C8.55004 12.0288 7.90869 12.7608 7.90869 13.6638C7.90869 14.5668 8.55004 15.2988 9.34119 15.2988Z" />
      <path d="M14.6588 15.2988C15.45 15.2988 16.0913 14.5668 16.0913 13.6638C16.0913 12.7608 15.45 12.0288 14.6588 12.0288C13.8677 12.0288 13.2263 12.7608 13.2263 13.6638C13.2263 14.5668 13.8677 15.2988 14.6588 15.2988Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 34 35" {...iconProps} strokeWidth={1.5}>
      <path d="M20 27.8462V23.8462C20.1392 22.5935 19.78 21.3363 19 20.3462C22 20.3462 25 18.3462 25 14.8462C25.08 13.5962 24.73 12.3662 24 11.3462C24.28 10.1962 24.28 8.99619 24 7.84619C24 7.84619 23 7.84619 21 9.34619C18.36 8.84619 15.64 8.84619 13 9.34619C11 7.84619 10 7.84619 10 7.84619C9.70004 8.99619 9.70004 10.1962 10 11.3462C9.27191 12.3621 8.91851 13.599 9.00004 14.8462C9.00004 18.3462 12 20.3462 15 20.3462C14.61 20.8362 14.32 21.3962 14.15 21.9962C13.98 22.5962 13.93 23.2262 14 23.8462V27.8462" />
      <path d="M14 23.8462C9.49 25.8462 9 21.8462 7 21.8462" strokeWidth={2} />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 34 35" {...iconProps} strokeWidth={1.5}>
      <path d="M21 13.8462C22.5913 13.8462 24.1174 14.4783 25.2426 15.6036C26.3679 16.7288 27 18.2549 27 19.8462V26.8462H23V19.8462C23 19.3158 22.7893 18.8071 22.4142 18.432C22.0391 18.0569 21.5304 17.8462 21 17.8462C20.4696 17.8462 19.9609 18.0569 19.5858 18.432C19.2107 18.8071 19 19.3158 19 19.8462V26.8462H15V19.8462C15 18.2549 15.6321 16.7288 16.7574 15.6036C17.8826 14.4783 19.4087 13.8462 21 13.8462Z" />
      <path d="M11 14.8462H7V26.8462H11V14.8462Z" />
      <path d="M9 11.8462C10.1046 11.8462 11 10.9508 11 9.84619C11 8.74162 10.1046 7.84619 9 7.84619C7.89543 7.84619 7 8.74162 7 9.84619C7 10.9508 7.89543 11.8462 9 11.8462Z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 34 35" aria-hidden="true" focusable="false" fill="currentColor" className="size-6">
      <path d="M23.2436 8.09619H26.553L19.3249 16.3556L27.828 27.5962H21.1717L15.9545 20.7806L9.99204 27.5962H6.67798L14.4077 18.7603L6.2561 8.09619H13.0811L17.792 14.3259L23.2436 8.09619ZM22.0811 25.6181H23.9139L12.0827 9.97119H10.1139L22.0811 25.6181Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 34 34" {...iconProps} strokeWidth={2}>
      <path d="M7.50001 22C6.80143 18.7033 6.80143 15.2967 7.50001 12C7.5918 11.6652 7.76914 11.3601 8.01461 11.1146C8.26008 10.8691 8.56522 10.6918 8.90001 10.6C14.2635 9.71146 19.7366 9.71146 25.1 10.6C25.4348 10.6918 25.7399 10.8691 25.9854 11.1146C26.2309 11.3601 26.4082 11.6652 26.5 12C27.1986 15.2967 27.1986 18.7033 26.5 22C26.4082 22.3348 26.2309 22.6399 25.9854 22.8854C25.7399 23.1309 25.4348 23.3082 25.1 23.4C19.7366 24.2887 14.2634 24.2887 8.90001 23.4C8.56522 23.3082 8.26008 23.1309 8.01461 22.8854C7.76914 22.6399 7.5918 22.3348 7.50001 22Z" />
      <path d="M15 20L20 17L15 14V20Z" />
    </svg>
  ),
} satisfies Record<string, React.ReactNode>

/** Monark's five social accounts, with English labels. Map over it to translate. */
const MONARK_SOCIALS: SiteFooterSocial[] = [
  { key: "discord", href: "https://discord.gg/TvhrbFCp8T", label: "Monark on Discord", icon: SOCIAL_ICONS.discord },
  { key: "github", href: "https://github.com/monark-community", label: "Monark on GitHub", icon: SOCIAL_ICONS.github },
  { key: "linkedin", href: "https://www.linkedin.com/company/monark-io/about/", label: "Monark on LinkedIn", icon: SOCIAL_ICONS.linkedin },
  { key: "twitter", href: "https://x.com/monark_io", label: "Monark on X", icon: SOCIAL_ICONS.twitter },
  { key: "youtube", href: "https://www.youtube.com/@monark_io", label: "Monark on YouTube", icon: SOCIAL_ICONS.youtube },
]

const isExternal = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href)

// Bands 2 and 3 sit on a darker surface, like monark.io's lowest band: the
// secondary tint in light mode, the background 5% darker in dark mode.
const LOW_BAND = "border-t bg-secondary dark:bg-[oklch(from_var(--background)_calc(l-0.05)_c_h)]"

export interface SiteFooterProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The product name, set in text (e.g. "Splitflow"). */
  product: React.ReactNode
  /** One sentence on what the product does. */
  description?: React.ReactNode
  /** The site's own pages, in the product band. */
  links?: SiteFooterLink[]
  /**
   * Extra product-band content under the name and links, e.g. a row of
   * sibling demos ("The Monark DeFi family").
   */
  children?: React.ReactNode
  /** Underlined links in the Monark band: the project page, the source repo. */
  resources?: SiteFooterLink[]
  /** Social links. Defaults to Monark's five; pass `[]` to hide them. */
  socials?: SiteFooterSocial[]
  /** Monark's home page. Default "https://www.monark.io". */
  monarkHref?: string
  /**
   * Replaces the default Monark logo (`MonarkLogo`: the official horizontal
   * logo, with the outlined wordmark drawn in `currentColor`).
   */
  monarkLogo?: React.ReactNode
  /** Copyright line. Default `© {year} Monark · Open source`. */
  copyright?: React.ReactNode
  /**
   * The persistent demo notice in the bottom band. Default
   * "Demo · simulated data"; pass `null` once the product is live.
   */
  demoNotice?: React.ReactNode
  /** Small links in the bottom band, e.g. photo credits. */
  legalLinks?: SiteFooterLink[]
  /** Link component for internal links. Default: a plain `<a>`. External URLs always use `<a>`. */
  LinkComponent?: SiteFooterLinkComponent
  labels?: SiteFooterLabels
  /** Classes for each band's inner row (max width, side padding). */
  containerClassName?: string
}

/**
 * The standard Monark three-band footer (brand guidelines §10): the
 * product band (name, one line, page links), the Monark band ("Built by
 * Monark", logo, tagline, project + repo links, socials) and the legal
 * band (copyright, demo notice, credits) on a darker surface.
 */
function SiteFooter({
  product,
  description,
  links = [],
  children,
  resources = [],
  socials = MONARK_SOCIALS,
  monarkHref = "https://www.monark.io",
  monarkLogo,
  copyright,
  demoNotice = "Demo · simulated data",
  legalLinks = [],
  LinkComponent = "a",
  labels,
  className,
  containerClassName,
  ...props
}: SiteFooterProps) {
  const row = cn("mx-auto max-w-6xl px-4 sm:px-6", containerClassName)
  function renderLink(link: SiteFooterLink, linkClass: string) {
    const Comp: SiteFooterLinkComponent = isExternal(link.href) ? "a" : LinkComponent
    return (
      <Comp href={link.href} className={linkClass}>
        {link.label}
      </Comp>
    )
  }
  const legal = [
    copyright ?? `© ${new Date().getFullYear()} Monark · Open source`,
    demoNotice ? <span className="font-semibold text-foreground">{demoNotice}</span> : null,
    ...legalLinks.map((link) => (
      renderLink(link, "inline-flex min-h-11 items-center underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-0")
    )),
  ].filter(Boolean)

  return (
    <footer data-slot="site-footer" className={cn("mt-auto border-t bg-background", className)} {...props}>
      {/* Band 1: product */}
      <div data-slot="site-footer-product" className={cn(row, "py-10")}>
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div className="max-w-md">
            <p className="text-lg font-extrabold text-foreground">{product}</p>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {links.length > 0 ? (
            <nav aria-label={labels?.productNav ?? "Site pages"}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
                {links.map((link) => (
                  <li key={link.href}>
                    {renderLink(link, "inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-0")}
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
        {children ? (
          <div data-slot="site-footer-extra" className="mt-8">
            {children}
          </div>
        ) : null}
      </div>

      {/* Band 2: Monark */}
      <div data-slot="site-footer-monark" className={LOW_BAND}>
        <div className={cn(row, "flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between")}>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">{labels?.builtBy ?? "Built by Monark"}</p>
            <a
              href={monarkHref}
              aria-label={labels?.monarkHome ?? "Monark home page"}
              className="-m-2 w-fit rounded-md p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {monarkLogo ?? <MonarkLogo className="h-9" />}
            </a>
            <p className="text-sm text-muted-foreground">
              {labels?.tagline ?? "Fostering Collaboration within the Web3 Community"}
            </p>
          </div>
          {resources.length > 0 || socials.length > 0 ? (
            <div className="flex flex-col gap-4 md:items-end">
              {resources.length > 0 ? (
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                  {resources.map((link) => (
                    <li key={link.href}>
                      {renderLink(link, "inline-flex min-h-11 items-center rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-0")}
                    </li>
                  ))}
                </ul>
              ) : null}
              {socials.length > 0 ? (
                <ul
                  aria-label={labels?.socials ?? "Monark on social media"}
                  data-slot="site-footer-socials"
                  className="flex items-center gap-1"
                >
                  {socials.map((social) => (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        title={social.label}
                        className="inline-flex size-11 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-border focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {social.icon}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Band 3: legal */}
      <div data-slot="site-footer-legal" className={LOW_BAND}>
        <div
          className={cn(
            row,
            "flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:flex-wrap md:items-center md:gap-x-4"
          )}
        >
          {legal.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 ? (
                <span aria-hidden="true" className="hidden md:inline">
                  ·
                </span>
              ) : null}
              <span className="inline-flex items-center">{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  )
}

export { SiteFooter, MONARK_SOCIALS }
