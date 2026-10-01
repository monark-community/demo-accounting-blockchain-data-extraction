import { EXPENSES, INCOME, kindOf, nameOf } from "./classify"
import { seededHex } from "./ids"
import { NETWORK_NAME } from "./network"
import { FX, inPeriod, priceOn } from "./prices"
import type { Books, CategoryId, Currency, Entry, ExpenseCategory, IncomeCategory, PeriodId } from "./types"

const cents = (n: number) => Math.round(n * 100) / 100

/** Value of the entry's main amount at the time, in `currency` (swaps: what was sold). */
export function valueOf(e: Entry, currency: Currency): number {
  return cents(e.amount * priceOn(e.token, e.timestamp) * FX[currency])
}

/** Network fee paid by the books, valued at the time, in `currency`. */
export function feeValueOf(e: Entry, currency: Currency): number {
  return e.feeEth ? cents(e.feeEth * priceOn("tETH", e.timestamp) * FX[currency]) : 0
}

export interface Statement {
  income: { category: IncomeCategory; total: number; count: number }[]
  expenses: { category: ExpenseCategory; total: number; count: number }[]
  totalIncome: number
  totalExpenses: number
  fees: number
  net: number
  /** Entries in the period, all kinds. */
  count: number
  review: number
  internal: number
}

export function entriesIn(entries: Entry[], period: PeriodId): Entry[] {
  return entries.filter((e) => inPeriod(e.timestamp, period))
}

/** An income statement for the period. Entries still in review are not counted. */
export function statementOf(entries: Entry[], period: PeriodId, currency: Currency): Statement {
  const list = entriesIn(entries, period)
  const inc = new Map<IncomeCategory, { total: number; count: number }>()
  const exp = new Map<ExpenseCategory, { total: number; count: number }>()
  let fees = 0
  let review = 0
  let internal = 0
  for (const e of list) {
    fees += feeValueOf(e, currency)
    const kind = kindOf(e.category)
    if (kind === "review") review++
    if (e.category === "internal") internal++
    if (kind === "income") {
      const c = e.category as IncomeCategory
      const cur = inc.get(c) ?? { total: 0, count: 0 }
      inc.set(c, { total: cur.total + valueOf(e, currency), count: cur.count + 1 })
    } else if (kind === "expense") {
      const c = e.category as ExpenseCategory
      const cur = exp.get(c) ?? { total: 0, count: 0 }
      exp.set(c, { total: cur.total + valueOf(e, currency), count: cur.count + 1 })
    }
  }
  const income = INCOME.filter((c) => inc.has(c)).map((c) => ({ category: c, total: cents(inc.get(c)!.total), count: inc.get(c)!.count }))
  const expenses = EXPENSES.filter((c) => exp.has(c)).map((c) => ({ category: c, total: cents(exp.get(c)!.total), count: exp.get(c)!.count }))
  const totalIncome = cents(income.reduce((s, x) => s + x.total, 0))
  const totalExpenses = cents(expenses.reduce((s, x) => s + x.total, 0))
  fees = cents(fees)
  return { income, expenses, totalIncome, totalExpenses, fees, net: cents(totalIncome - totalExpenses - fees), count: list.length, review, internal }
}

/* ---------------------------------------------------------------------------
 * Exports. Column names stay in English (accounting tools map them); the
 * category names follow the visitor's language.
 * ------------------------------------------------------------------------ */

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n"
}

const fixed = (n: number, d = 2) => n.toFixed(d)

export function ledgerCsv(entries: Entry[], books: Books, period: PeriodId, currency: Currency, names: Record<CategoryId, string>): string {
  const rows: (string | number)[][] = [
    ["date_utc", "wallet", "direction", "counterparty", "counterparty_address", "category", "category_source", "token", "amount", "received_token", "received_amount", `price_${currency.toLowerCase()}`, `value_${currency.toLowerCase()}`, "fee_teth", `fee_${currency.toLowerCase()}`, "tx_hash", "block", "network"],
  ]
  for (const e of [...entriesIn(entries, period)].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    rows.push([
      e.timestamp.replace("T", " ").replace("Z", ""),
      nameOf(e.wallet, books) ?? e.wallet,
      e.direction,
      nameOf(e.counterparty, books) ?? "",
      e.counterparty,
      names[e.category],
      e.source,
      e.token,
      e.amount,
      e.received?.token ?? "",
      e.received?.amount ?? "",
      fixed(priceOn(e.token, e.timestamp) * FX[currency], 4),
      fixed(valueOf(e, currency)),
      e.feeEth ? e.feeEth.toFixed(8) : "0",
      fixed(feeValueOf(e, currency)),
      e.hash,
      e.block,
      NETWORK_NAME,
    ])
  }
  return csv(rows)
}

export interface JournalLine {
  no: number
  date: string
  account: string
  debit: number
  credit: number
  memo: string
}

/** Double-entry journal lines: one balanced entry per transaction, plus the network fee. */
export function journalOf(entries: Entry[], books: Books, period: PeriodId, currency: Currency, names: Record<CategoryId, string>, accounts: { assets: string; income: string; expenses: string }): JournalLine[] {
  const lines: JournalLine[] = []
  let no = 0
  const asset = (token: string, wallet: string) => `${accounts.assets}:${token} (${nameOf(wallet, books) ?? wallet.slice(0, 8)})`
  for (const e of [...entriesIn(entries, period)].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    const kind = kindOf(e.category)
    if (kind === "review") continue
    const date = e.timestamp.slice(0, 10)
    const who = nameOf(e.counterparty, books) ?? `${e.counterparty.slice(0, 6)}…${e.counterparty.slice(-4)}`
    const memo = `${who} · ${e.hash.slice(0, 10)}`
    const v = valueOf(e, currency)
    const push = (debit: string, credit: string, amount: number) => {
      no++
      lines.push({ no, date, account: debit, debit: amount, credit: 0, memo }, { no, date, account: credit, debit: 0, credit: amount, memo })
    }
    if (kind === "income") push(asset(e.token, e.wallet), `${accounts.income}:${names[e.category]}`, v)
    else if (kind === "expense") push(`${accounts.expenses}:${names[e.category]}`, asset(e.token, e.wallet), v)
    else if (e.category === "swap" && e.received) push(asset(e.received.token, e.wallet), asset(e.token, e.wallet), v)
    else if (e.category === "internal" && e.direction === "out") push(asset(e.token, e.counterparty), asset(e.token, e.wallet), v)
    const fee = feeValueOf(e, currency)
    if (fee > 0) push(`${accounts.expenses}:${names.fees}`, asset("tETH", e.wallet), fee)
  }
  return lines
}

export function journalCsv(lines: JournalLine[], currency: Currency): string {
  return csv([
    ["journal_no", "date", "account", "debit", "credit", "currency", "memo"],
    ...lines.map((l) => [l.no, l.date, l.account, l.debit ? fixed(l.debit) : "", l.credit ? fixed(l.credit) : "", currency, l.memo]),
  ])
}

/** The report's fingerprint: a hash of its canonical ledger (English, USD), so the language never changes it. */
export function fingerprintOf(entries: Entry[], books: Books, period: PeriodId): string {
  const canonical = entriesIn(entries, period)
    .map((e) => `${e.hash}|${e.wallet.toLowerCase()}|${e.category}|${e.amount}|${e.token}`)
    .sort()
    .join("\n")
  return `0x${seededHex(`${period}\n${books.wallets.map((w) => w.address.toLowerCase()).sort().join(",")}\n${canonical}`, 64)}`
}

/** Trigger a browser download of a text file. */
export function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
