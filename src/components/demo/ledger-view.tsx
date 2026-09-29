"use client"

import { LinkIcon, PlusIcon, SearchIcon, SparklesIcon, XIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { classifyAll, kindOf, nameOf, ownWalletSuggestion } from "@/lib/demo/classify"
import { useExtraction } from "@/lib/demo/extract"
import { sameAddress } from "@/lib/demo/network"
import { addWallet, clearCombined, dismissSuggestion, openBooks, removeWallet } from "@/lib/demo/ops"
import { inPeriod, PERIODS } from "@/lib/demo/prices"
import { feeValueOf, statementOf, valueOf } from "@/lib/demo/report"
import { CAMPUS_OPS, SAMPLES } from "@/lib/demo/seed"
import { setPrefs, useDemo } from "@/lib/demo/store"
import type { Books, BooksWallet, Entry, PeriodId, RawTx, SampleId } from "@/lib/demo/types"
import { formatDay, formatMoney, formatToken, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { AddWalletDialog } from "./add-wallet-dialog"
import { useAppCopy } from "./app-provider"
import { CategoryChip, useAnimatedNumber } from "./bits"
import { EntrySheet } from "./entry-sheet"
import { ExtractionPanel } from "./extraction-panel"
import { RulesDialog } from "./rules-dialog"
import { StartView } from "./start-view"

type Filter = "all" | "review" | "income" | "expenses"
const PAGE = 25

/** /app: start screen → extraction → the ledger with its review queue. */
export function LedgerView() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const books = demo?.books ?? null
  // What the running extraction is for: new books, or a wallet joining them.
  const pending = useRef<{ mode: "open"; name: string; sample: SampleId | null; wallet: BooksWallet } | { mode: "add"; wallet: BooksWallet } | null>(null)

  const [extractingName, setExtractingName] = useState("")

  const onDone = useCallback((_address: string, txs: RawTx[]) => {
    const p = pending.current
    pending.current = null
    if (!p) return
    if (p.mode === "open") openBooks(p.name, p.sample, p.wallet, txs)
    else addWallet(p.wallet, txs)
  }, [])
  const ex = useExtraction(onDone)

  const startSample = useCallback(
    (id: SampleId) => {
      const s = SAMPLES[id]
      pending.current = { mode: "open", name: s.books, sample: id, wallet: s.wallet }
      setExtractingName(s.books)
      ex.start(s.wallet.address)
    },
    [ex]
  )

  const startAddress = useCallback(
    (address: string) => {
      const name = shortAddress(address)
      pending.current = { mode: "open", name, sample: null, wallet: { address, name: t(app.books.walletLabel, { n: 1 }) } }
      setExtractingName(name)
      ex.start(address)
    },
    [ex, app.books.walletLabel]
  )

  const startAdd = useCallback(
    (wallet: BooksWallet) => {
      pending.current = { mode: "add", wallet }
      setExtractingName(wallet.name)
      ex.start(wallet.address)
    },
    [ex]
  )

  // "Try a sample wallet" on the home page links to /app?sample=campus.
  const autoStarted = useRef(false)
  useEffect(() => {
    if (!demo || autoStarted.current) return
    autoStarted.current = true
    try {
      const params = new URLSearchParams(window.location.search)
      const sample = params.get("sample")
      if (sample === "campus" || sample === "lea") {
        window.history.replaceState(null, "", window.location.pathname)
        // Deferred: start the extraction after this render, not inside the effect.
        if (!demo.books) setTimeout(() => startSample(sample), 0)
      }
    } catch {
      /* no URL access: stay on the start screen */
    }
  }, [demo, startSample])

  if (!demo) return null
  const running = ex.state.phase !== "idle"

  if (!books) {
    return running ? (
      <div className="flex flex-1 flex-col justify-center py-4">
        <ExtractionPanel state={ex.state} name={extractingName} books={null} onRetry={ex.retry} onCancel={() => {
          pending.current = null
          ex.cancel()
        }} />
      </div>
    ) : (
      <StartView onAddress={startAddress} onSample={startSample} />
    )
  }

  return (
    <Ledger
      books={books}
      period={demo.prefs.period}
      currency={demo.prefs.currency}
      onAddWallet={startAdd}
      extraction={
        running ? (
          <ExtractionPanel
            compact
            state={ex.state}
            name={extractingName}
            books={books}
            onRetry={ex.retry}
            onCancel={() => {
              pending.current = null
              ex.cancel()
            }}
          />
        ) : null
      }
      busy={running}
    />
  )
}

function Ledger({
  books,
  period,
  currency,
  onAddWallet,
  extraction,
  busy,
}: {
  books: Books
  period: PeriodId
  currency: Parameters<typeof formatMoney>[1]
  onAddWallet: (w: BooksWallet) => void
  extraction: React.ReactNode
  busy: boolean
}) {
  const { app } = useAppCopy()
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [shown, setShown] = useState(PAGE)
  const [openHash, setOpenHash] = useState<string | null>(null)
  const [touched, setTouched] = useState<string | null>(null)

  const all = useMemo(() => classifyAll(books), [books])
  const inRange = useMemo(() => all.filter((e) => inPeriod(e.timestamp, period)), [all, period])
  const reviewCount = inRange.filter((e) => e.category === "review").length
  const statement = useMemo(() => statementOf(all, period, currency), [all, period, currency])
  const suggestion = useMemo(() => ownWalletSuggestion(books, all), [books, all])

  const q = query.trim().toLowerCase()
  const visible = inRange.filter((e) => {
    const kind = kindOf(e.category)
    if (filter === "review" && kind !== "review") return false
    if (filter === "income" && kind !== "income") return false
    if (filter === "expenses" && kind !== "expense") return false
    if (!q) return true
    const name = (nameOf(e.counterparty, books) ?? "").toLowerCase()
    return name.includes(q) || e.counterparty.toLowerCase().includes(q) || e.hash.toLowerCase().includes(q)
  })

  // Flash the rows that just became own-wallet transfers, then clear the note's animation state.
  const combined = books.combined
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (!combined) return
    const on = setTimeout(() => setFlash(true), 0)
    const off = setTimeout(() => setFlash(false), 2600)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [combined])

  const openEntry = visible.find((e) => e.hash === openHash) ?? all.find((e) => e.hash === openHash) ?? null
  const periodLabel = app.period[period]
  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: app.filters.all },
    { id: "review", label: app.filters.review, count: reviewCount },
    { id: "income", label: app.filters.income },
    { id: "expenses", label: app.filters.expenses },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Books header: name, wallets, add wallet. */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{books.name}</h1>
          <ul aria-label={app.books.wallets} className="mt-3 flex flex-wrap gap-2">
            {books.wallets.map((w) => (
              <li key={w.address} className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-1 text-sm">
                <WalletAvatar address={w.address} size={24} />
                <span className="font-bold">{w.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{shortAddress(w.address)}</span>
                {books.wallets.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeWallet(w.address)}
                    aria-label={t(app.books.remove, { name: w.name })}
                    className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <XIcon className="size-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <span className="w-1.5" />
                )}
              </li>
            ))}
            <li>
              <AddWalletDialog books={books} disabled={busy} onAdd={onAddWallet} />
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPrefs({ period: v as PeriodId })}>
            <SelectTrigger aria-label={app.period.label} className="w-auto min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {app.period[p.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RulesDialog books={books} entries={all} />
        </div>
      </header>

      {extraction}

      {/* One line at a time: the combined result, or the own-wallet suggestion. */}
      {combined && !busy ? (
        <div role="status" className="ll-in flex items-start gap-3 rounded-2xl border bg-card p-3.5 text-sm sm:items-center">
          <LinkIcon className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" aria-hidden="true" />
          <p className="flex-1">{combined.count ? t(app.books.combined, { n: combined.count }) : app.books.combinedNone}</p>
          <Button size="icon-sm" variant="ghost" onClick={clearCombined} aria-label={app.close}>
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      ) : suggestion && !busy ? (
        <div className="ll-in flex flex-col gap-3 rounded-2xl border border-primary/50 bg-card p-3.5 text-sm sm:flex-row sm:items-center">
          <SparklesIcon className="hidden size-4 shrink-0 text-primary sm:block" aria-hidden="true" />
          <p className="flex-1">
            {t(app.books.suggestion, { n: suggestion.count, address: "\u0000" })
              .split("\u0000")
              .flatMap((part, i) => (i === 0 ? [part] : [<span key={i} className="font-mono text-xs font-bold">{shortAddress(suggestion.address)}</span>, part]))}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="ghost" onClick={() => dismissSuggestion(suggestion.address)}>
              {app.books.suggestionDismiss}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onAddWallet({
                  address: suggestion.address,
                  name: sameAddress(suggestion.address, CAMPUS_OPS.address) ? app.books.suggestionName : t(app.books.walletLabel, { n: books.wallets.length + 1 }),
                })
              }
            >
              <PlusIcon aria-hidden="true" />
              {app.books.suggestionAdd}
            </Button>
          </div>
        </div>
      ) : null}

      <SummaryStrip
        label={t(app.summary.label, { period: periodLabel })}
        items={[
          { label: app.summary.income, value: statement.totalIncome },
          { label: app.summary.expenses, value: statement.totalExpenses },
          { label: app.summary.fees, value: statement.fees },
          { label: app.summary.net, value: statement.net, strong: true },
        ]}
        currency={currency}
        info={app.summary.info}
      />

      {/* Filters and search. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={app.filters.label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:pb-0">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => {
                setFilter(f.id)
                setShown(PAGE)
              }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150",
                filter === f.id ? "border-foreground bg-foreground text-background" : "border-input text-foreground hover:bg-muted"
              )}
            >
              {f.label}
              {f.count ? (
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                    filter === f.id ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {f.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative md:w-80">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShown(PAGE)
            }}
            placeholder={app.filters.search}
            aria-label={app.filters.search}
            className="h-10 rounded-full pl-10"
          />
        </div>
      </div>

      {visible.length ? (
        <EntryTable
          entries={visible.slice(0, shown)}
          books={books}
          currency={currency}
          caption={t(app.table.caption, { period: periodLabel })}
          flashInternal={flash}
          touched={touched}
          onOpen={setOpenHash}
        />
      ) : (
        <EmptyState
          filter={filter}
          query={query}
          period={period}
          hasAny={inRange.length > 0}
        />
      )}

      {visible.length > shown ? (
        <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
          {t(app.table.more, { n: Math.min(PAGE, visible.length - shown) })}
        </Button>
      ) : null}

      <EntrySheet
        entry={openEntry}
        books={books}
        entries={all}
        currency={currency}
        onClose={() => setOpenHash(null)}
        onSaved={(hash) => {
          setTouched(hash)
          setOpenHash(null)
        }}
      />
    </div>
  )
}

function SummaryStrip({
  label,
  items,
  currency,
  info,
}: {
  label: string
  items: { label: string; value: number; strong?: boolean }[]
  currency: Parameters<typeof formatMoney>[1]
  info: string
}) {
  const { app } = useAppCopy()
  return (
    <section aria-label={label} className="relative grid grid-cols-2 overflow-hidden rounded-2xl border bg-card md:grid-cols-4">
      {items.map((item, i) => (
        <SummaryItem key={item.label} {...item} currency={currency} className={cn(i % 2 === 1 && "border-l", i >= 2 && "border-t md:border-t-0", i === 2 && "md:border-l")} />
      ))}
      <InfoTip label={app.sheet.how} className="absolute top-1.5 right-1.5">
        {info}
      </InfoTip>
    </section>
  )
}

function SummaryItem({ label, value, strong, currency, className }: { label: string; value: number; strong?: boolean; currency: Parameters<typeof formatMoney>[1]; className?: string }) {
  const { locale } = useAppCopy()
  const shown = useAnimatedNumber(value)
  return (
    <div className={cn("flex flex-col gap-1 p-4", className)}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-extrabold tabular-nums sm:text-xl", strong && value < 0 && "text-destructive")}>{formatMoney(shown, currency, locale)}</span>
    </div>
  )
}

function EntryTable({
  entries,
  books,
  currency,
  caption,
  flashInternal,
  touched,
  onOpen,
}: {
  entries: Entry[]
  books: Books
  currency: Parameters<typeof formatMoney>[1]
  caption: string
  flashInternal: boolean
  touched: string | null
  onOpen: (hash: string) => void
}) {
  const { app, locale } = useAppCopy()
  const tb = app.table
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
          <tr>
            <th scope="col" className="hidden w-24 px-4 py-2.5 md:table-cell">
              {tb.date}
            </th>
            <th scope="col" className="px-4 py-2.5">
              {tb.counterparty}
            </th>
            <th scope="col" className="hidden w-52 px-4 py-2.5 md:table-cell">
              {tb.category}
            </th>
            <th scope="col" className="w-36 px-4 py-2.5 text-right sm:w-44">
              {tb.amount}
            </th>
            <th scope="col" className="hidden w-32 px-4 py-2.5 text-right lg:table-cell">
              {tb.value}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {entries.map((e) => {
            const who = nameOf(e.counterparty, books)
            const verb = e.method === "swap" ? tb.swap : e.method === "approve" ? tb.approve : e.direction === "in" ? tb.in : tb.out
            const fee = feeValueOf(e, currency)
            const flash = (flashInternal && e.category === "internal") || touched === e.hash
            return (
              <tr
                key={e.hash}
                onClick={() => onOpen(e.hash)}
                className={cn("cursor-pointer transition-colors duration-150 hover:bg-muted/40", flash && "ll-flash", e.category === "internal" && "text-muted-foreground")}
              >
                <td className="hidden px-4 py-3 align-top text-muted-foreground tabular-nums md:table-cell">{formatDay(e.timestamp, locale)}</td>
                <td className="px-4 py-3 align-top">
                  <span className="block text-xs text-muted-foreground">
                    <span className="md:hidden">{formatDay(e.timestamp, locale)} · </span>
                    {verb}
                  </span>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      onOpen(e.hash)
                    }}
                    className="block max-w-full truncate text-left font-bold text-foreground underline-offset-4 hover:underline focus-visible:underline"
                    aria-label={`${tb.open}: ${who ?? e.counterparty}`}
                  >
                    {who ?? <span className="font-mono text-xs">{shortAddress(e.counterparty)}</span>}
                  </button>
                  <CategoryChip category={e.category} label={app.categories[e.category]} className="mt-1.5 md:hidden" />
                </td>
                <td className="hidden px-4 py-3 align-top md:table-cell">
                  <CategoryChip category={e.category} label={app.categories[e.category]} />
                  {e.source === "rule" || e.source === "you" ? (
                    <span className="mt-1 block text-xs text-muted-foreground">{app.sources[e.source]}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <span className={cn("block font-mono text-[0.8125rem] font-semibold tabular-nums", e.direction === "in" && e.category !== "internal" && "text-success")}>
                    {e.method === "approve" ? "—" : `${e.direction === "in" ? "+" : "−"}${formatToken(e.amount, e.token, locale)}`}
                  </span>
                  {e.received ? <span className="block font-mono text-xs text-muted-foreground tabular-nums">+{formatToken(e.received.amount, e.received.token, locale)}</span> : null}
                  <span className="block text-xs text-muted-foreground tabular-nums lg:hidden">
                    {e.method === "approve" ? t(tb.fee, { value: formatMoney(fee, currency, locale) }) : formatMoney(valueOf(e, currency), currency, locale)}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-right align-top tabular-nums lg:table-cell">
                  <span className="block">{e.method === "approve" ? "—" : formatMoney(valueOf(e, currency), currency, locale)}</span>
                  {fee ? <span className="block text-xs text-muted-foreground">{t(tb.fee, { value: formatMoney(fee, currency, locale) })}</span> : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ filter, query, period, hasAny }: { filter: Filter; query: string; period: PeriodId; hasAny: boolean }) {
  const { app } = useAppCopy()
  const other: PeriodId = period === "q3" ? "q2" : "q3"
  let line = app.empty.period
  let action: React.ReactNode = (
    <Button variant="outline" size="sm" onClick={() => setPrefs({ period: other })}>
      {t(app.empty.changePeriod, { period: app.period[other] })}
    </Button>
  )
  if (hasAny && query.trim()) {
    line = t(app.empty.search, { q: query.trim() })
    action = null
  } else if (hasAny && filter === "review") {
    line = app.empty.review
    action = null
  } else if (hasAny) {
    action = null
  }
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
      <p className="font-semibold">{line}</p>
      {action}
    </div>
  )
}
