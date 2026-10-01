import { sameAddress } from "./network"
import { DIRECTORY } from "./seed"
import type { Books, CategoryId, Entry, ExpenseCategory, IncomeCategory, Kind, StoredEntry } from "./types"

export const INCOME: IncomeCategory[] = ["grants", "dues", "revenue", "rewards", "otherIncome"]
export const EXPENSES: ExpenseCategory[] = ["payroll", "services", "events", "otherExpense"]
/** Every category a person can pick in the entry sheet. */
export const PICKABLE: CategoryId[] = [...INCOME, ...EXPENSES, "internal", "swap", "fees"]

export function kindOf(c: CategoryId): Kind {
  if ((INCOME as string[]).includes(c)) return "income"
  if ((EXPENSES as string[]).includes(c)) return "expense"
  if (c === "fees") return "fees"
  if (c === "review") return "review"
  return "neutral"
}

export function isOwnWallet(address: string, books: Books): boolean {
  return books.wallets.some((w) => sameAddress(w.address, address))
}

/**
 * Resolve an entry's category. The first match wins:
 * 1. you changed it, 2. one of your rules, 3. between your wallets,
 * 4. a known contract (swap, approval), 5. a known address, else review.
 */
export function classify(e: StoredEntry, books: Books): Entry {
  if (e.manual) return { ...e, category: e.manual, source: "you" }
  const rule = books.rules.find((r) => sameAddress(r.address, e.counterparty))
  if (rule) return { ...e, category: rule.category, source: "rule" }
  if (isOwnWallet(e.counterparty, books)) return { ...e, category: "internal", source: "auto" }
  if (e.method === "swap") return { ...e, category: "swap", source: "auto" }
  if (e.method === "approve") return { ...e, category: "fees", source: "auto" }
  const known = DIRECTORY[e.counterparty.toLowerCase()]
  const guess = known?.[e.direction]
  if (guess) return { ...e, category: guess, source: "auto" }
  return { ...e, category: "review", source: "none" }
}

export function classifyAll(books: Books): Entry[] {
  return books.entries.map((e) => classify(e, books)).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/** A readable name for an address: your label, one of your wallets, the directory, or null. */
export function nameOf(address: string, books: Books | null): string | null {
  if (!books) return DIRECTORY[address.toLowerCase()]?.name ?? null
  const own = books.wallets.find((w) => sameAddress(w.address, address))
  if (own) return own.name
  const key = Object.keys(books.labels).find((k) => sameAddress(k, address))
  if (key) return books.labels[key] ?? null
  return DIRECTORY[address.toLowerCase()]?.name ?? null
}

/**
 * "Is this one of your wallets?": an unnamed address that received at least
 * two transfers still waiting for review, and that you haven't dismissed.
 */
export function ownWalletSuggestion(books: Books, entries: Entry[]): { address: string; count: number } | null {
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (e.category !== "review" || e.direction !== "out" || e.method !== "transfer") continue
    if (nameOf(e.counterparty, books)) continue
    if (books.dismissed.some((d) => sameAddress(d, e.counterparty))) continue
    const k = e.counterparty.toLowerCase()
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  let best: { address: string; count: number } | null = null
  for (const [address, count] of counts) if (count >= 2 && (!best || count > best.count)) best = { address, count }
  if (!best) return null
  const original = entries.find((e) => e.counterparty.toLowerCase() === best.address)?.counterparty ?? best.address
  return { address: original, count: best.count }
}
