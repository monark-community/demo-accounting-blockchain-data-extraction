export const locales = ["en", "fr"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** BCP 47 tag used for Intl number and date formatting. */
export const intlLocale: Record<Locale, string> = {
  en: "en-CA",
  fr: "fr-CA",
}

/** Prefix an internal path with the locale: href("fr", "/app") -> "/fr/app". */
export function href(locale: Locale, path = "/"): string {
  if (path === "/" || path === "") return `/${locale}`
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`
}

/** Swap the locale segment of a pathname, keeping the rest of the page. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/")
  if (parts.length > 1 && isLocale(parts[1] ?? "")) {
    parts[1] = to
    return parts.join("/") || `/${to}`
  }
  return href(to, pathname)
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerlift.monark.io"
).replace(/\/$/, "")

export const PROJECT_SLUG = "accounting-blockchain-data-extraction"
export const projectDocUrl = (locale: Locale) => `https://www.monark.io/${locale}/project/${PROJECT_SLUG}`
export const REPO_URL = "https://github.com/monark-community/demo-accounting-blockchain-data-extraction"
