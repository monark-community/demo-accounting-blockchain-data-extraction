import { seededHex } from "./ids"
import type { Currency, PeriodId, TokenSymbol } from "./types"

/**
 * Simulated daily price feed (USD) for the testnet tokens, around the Monark
 * demo reference prices (tETH $3,200, tUSDC $1.00, tDAI $1.00, tLINK $14.50).
 * Deterministic per day, so a report never changes between visits.
 */

const REFERENCE: Record<TokenSymbol, number> = { tETH: 3200, tUSDC: 1, tDAI: 1, tLINK: 14.5 }
const SWING: Record<TokenSymbol, number> = { tETH: 0.07, tUSDC: 0.0006, tDAI: 0.0008, tLINK: 0.1 }

function noise(key: string): number {
  return parseInt(seededHex(key, 8), 16) / 0xffffffff - 0.5
}

function dayIndex(iso: string): number {
  return Math.floor(Date.parse(iso.slice(0, 10) + "T00:00:00Z") / 86_400_000)
}

/** USD price of one token on the day of `iso`, rounded to the cent (4 decimals for stablecoins). */
export function priceOn(token: TokenSymbol, iso: string): number {
  const d = dayIndex(iso)
  const s = SWING[token]
  const wave = Math.sin(d / 11) * 0.6 + Math.sin(d / 3.7) * 0.25 + noise(`${token}:${d}`) * 0.3
  const p = REFERENCE[token] * (1 + s * wave)
  return REFERENCE[token] === 1 ? Math.round(p * 10_000) / 10_000 : Math.round(p * 100) / 100
}

/** Fixed demo exchange rates from USD. */
export const FX: Record<Currency, number> = { USD: 1, CAD: 1.37, EUR: 0.92 }
export const CURRENCIES: Currency[] = ["USD", "CAD", "EUR"]

export const PERIODS: { id: PeriodId; from: string; to: string }[] = [
  { id: "q3", from: "2026-07-01", to: "2026-09-30" },
  { id: "q2", from: "2026-04-01", to: "2026-06-30" },
  { id: "ytd", from: "2026-01-01", to: "2026-12-31" },
]

export function inPeriod(iso: string, period: PeriodId): boolean {
  const p = PERIODS.find((x) => x.id === period) ?? PERIODS[0]!
  const day = iso.slice(0, 10)
  return day >= p.from && day <= p.to
}
