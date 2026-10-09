import * as React from "react"

import { cn } from "cn"

/**
 * Any link component that renders an anchor from `href` + anchor props:
 * a plain `"a"` (the default), Next.js `Link`, or your i18n library's link.
 */
export type LocaleLinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface LocaleSwitchLabels<L extends string = string> {
  /** Accessible name of the switch. Default "Language". */
  label?: string
  /** Visible segment text per locale. Default: the locale code in upper case ("EN"). */
  short?: Partial<Record<L, string>>
  /** Full language name per locale, used as the segment's accessible name ("English", "Français"). */
  names?: Partial<Record<L, string>>
}

export interface LocaleSwitchProps<L extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The locales to offer, in display order, e.g. `["en", "fr"]`. */
  locales: readonly L[]
  /** The active locale; its segment is inverted and marked `aria-current`. */
  current: L
  /**
   * Where each segment links to. To keep the visitor on the same page,
   * build it from the current pathname, e.g. `/fr/how-it-works` for `fr`.
   */
  hrefFor: (locale: L) => string
  labels?: LocaleSwitchLabels<L>
  /** Link component for each segment. Default: a plain `<a>`. */
  LinkComponent?: LocaleLinkComponent
  /** Extra props for every segment link, e.g. `{ prefetch: false }` for Next.js `Link`. */
  linkProps?: Record<string, unknown>
}

/**
 * Compact language switch: a bordered pill of locale segments, the active
 * one inverted (foreground on background). Sits next to the theme toggle.
 */
function LocaleSwitch<L extends string>({
  locales,
  current,
  hrefFor,
  labels,
  LinkComponent = "a",
  linkProps,
  className,
  ...props
}: LocaleSwitchProps<L>) {
  return (
    <nav
      aria-label={labels?.label ?? "Language"}
      data-slot="locale-switch"
      className={cn("flex w-fit shrink-0 items-center rounded-full border p-0.5", className)}
      {...props}
    >
      {locales.map((locale) => {
        const active = locale === current
        return (
          <LinkComponent
            key={locale}
            href={hrefFor(locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            aria-label={labels?.names?.[locale]}
            className={cn(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-xs font-bold outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
            {...linkProps}
          >
            {labels?.short?.[locale] ?? locale.toUpperCase()}
          </LinkComponent>
        )
      })}
    </nav>
  )
}

export { LocaleSwitch }
