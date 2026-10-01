export type Locale = "en" | "fr"

/** Testnet tokens only: never real mainnet names. */
export type TokenSymbol = "tETH" | "tUSDC" | "tDAI" | "tLINK"

export type Currency = "USD" | "CAD" | "EUR"

export type PeriodId = "q3" | "q2" | "ytd"

export type IncomeCategory = "grants" | "dues" | "revenue" | "rewards" | "otherIncome"
export type ExpenseCategory = "payroll" | "services" | "events" | "otherExpense"
export type CategoryId = IncomeCategory | ExpenseCategory | "internal" | "swap" | "fees" | "review"

export type Kind = "income" | "expense" | "neutral" | "fees" | "review"

/** Where an entry's category came from. */
export type Source = "you" | "rule" | "auto" | "none"

export type Method = "transfer" | "swap" | "approve"

/** One on-chain transaction as seen from one of the books' wallets. */
export interface RawTx {
  hash: string
  block: number
  timestamp: string
  /** The books' wallet this transaction was read from. */
  wallet: string
  direction: "in" | "out"
  counterparty: string
  method: Method
  token: TokenSymbol
  /** Token units (not base units). 0 for approvals. */
  amount: number
  /** Swaps only: what came back. */
  received?: { token: TokenSymbol; amount: number }
  /** Gas paid by the books' wallet, in tETH (0 when someone else paid). */
  feeEth: number
  gasUsed: number
  gasPriceGwei: number
}

/** A stored entry: the raw transaction plus your manual category, if any. */
export interface StoredEntry extends RawTx {
  manual?: CategoryId
}

/** An entry as the UI sees it: category and source resolved by classify(). */
export interface Entry extends StoredEntry {
  category: CategoryId
  source: Source
}

export interface BooksWallet {
  address: string
  name: string
}

export interface Rule {
  id: string
  address: string
  category: CategoryId
  createdAt: string
}

export interface Seal {
  id: string
  period: PeriodId
  currency: Currency
  fingerprint: string
  entries: number
  hash: string
  block: number
  sealedAt: string
}

export type SampleId = "campus" | "lea"

export interface Books {
  name: string
  sample: SampleId | null
  wallets: BooksWallet[]
  entries: StoredEntry[]
  rules: Rule[]
  /** Your names for addresses (override the directory). */
  labels: Record<string, string>
  /** Addresses you said are not yours. */
  dismissed: string[]
  seals: Seal[]
  /** Set after a wallet is added, to show the one-line "combined" result and flash the rows. */
  combined: { count: number; address: string; at: number } | null
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
  lastError: "rejected" | null
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
}

export interface Prefs {
  period: PeriodId
  currency: Currency
}

export interface DemoState {
  version: 1
  books: Books | null
  wallet: WalletState
  settings: DemoSettings
  prefs: Prefs
  head: number
}

export interface TxSummaryRow {
  label: string
  value: string
  mono?: boolean
}

export interface TxSummary {
  title: string
  rows?: TxSummaryRow[]
  /** Show the "testnet · not tax or accounting advice" line (once per transaction). */
  movesValue?: boolean
  noFee?: boolean
}

export interface TxState {
  phase: "idle" | "signing" | "pending" | "confirmed" | "failed"
  hash?: string
  block?: number
  error?: "rejected" | "reverted"
}
