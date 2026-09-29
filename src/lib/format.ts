import { intlLocale, type Locale } from "@/i18n/config"
import type { Currency, TokenSymbol } from "@/lib/demo/types"

export function formatNumber(n: number, locale: Locale, maxFrac = 2): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: maxFrac }).format(n)
}

/** Money in the reporting currency, always with cents. */
export function formatMoney(n: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

/** Compact money for tight spots ($27.4K). */
export function formatMoneyCompact(n: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    notation: Math.abs(n) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(n) >= 10_000 ? 1 : 0,
  }).format(n)
}

export const tokenDecimals = (token: TokenSymbol) => (token === "tETH" ? 4 : 2)

export function formatToken(amount: number, token: TokenSymbol, locale: Locale): string {
  const d = tokenDecimals(token)
  return `${new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: token === "tETH" ? 0 : 2, maximumFractionDigits: d }).format(amount)} ${token}`
}

export function formatBlock(block: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(block)
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso))
}

/** "Sep 12" / "12 sept." */
export function formatDay(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) + " UTC"
}

export function shortHash(hash: string, start = 8, end = 6): string {
  return hash.length > start + end + 1 ? `${hash.slice(0, start)}…${hash.slice(-end)}` : hash
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
