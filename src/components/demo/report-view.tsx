"use client"

import { AlertTriangleIcon, DownloadIcon, FileTextIcon, StampIcon } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Disclosure } from "@/components/ui/disclosure"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TxFeedback } from "@/components/ui/tx-feedback"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { classifyAll } from "@/lib/demo/classify"
import { addSeal } from "@/lib/demo/ops"
import { CURRENCIES, PERIODS } from "@/lib/demo/prices"
import { download, fingerprintOf, journalCsv, journalOf, ledgerCsv, statementOf, type Statement } from "@/lib/demo/report"
import { setPrefs, useDemo } from "@/lib/demo/store"
import type { Books, Currency, PeriodId } from "@/lib/demo/types"
import { connectWallet } from "@/lib/demo/wallet"
import { formatBlock, formatDate, formatMoney, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/** /app/report: the period's income statement, the exports and the on-chain seal. */
export function ReportView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const books = demo.books
  if (!books) {
    return (
      <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <FileTextIcon className="size-10 text-primary" aria-hidden="true" />
        <p className="text-lg font-bold">{app.report.noBooks}</p>
        <Button asChild>
          <Link href={href(locale, "/app")}>{app.report.start}</Link>
        </Button>
      </div>
    )
  }
  return <Report books={books} period={demo.prefs.period} currency={demo.prefs.currency} />
}

function Report({ books, period, currency }: { books: Books; period: PeriodId; currency: Currency }) {
  const { app } = useAppCopy()
  const r = app.report
  const entries = useMemo(() => classifyAll(books), [books])
  const st = useMemo(() => statementOf(entries, period, currency), [entries, period, currency])
  const periodLabel = app.period[period]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">{books.name}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-display sm:text-4xl">{t(r.title, { period: periodLabel })}</h1>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPrefs({ period: v as PeriodId })}>
            <SelectTrigger aria-label={app.period.label} className="min-w-36">
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
          <Select value={currency} onValueChange={(v) => setPrefs({ currency: v as Currency })}>
            <SelectTrigger aria-label={app.currency.label} className="min-w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        <StatementCard st={st} currency={currency} />
        <div className="flex min-w-0 flex-col gap-6">
          <SealCard books={books} entries={entries} period={period} review={st.review} count={st.count} />
          <ExportCard books={books} entries={entries} period={period} currency={currency} count={st.count} />
        </div>
      </div>
    </div>
  )
}

function StatementCard({ st, currency }: { st: Statement; currency: Currency }) {
  const { app, locale } = useAppCopy()
  const r = app.report
  const money = (n: number) => formatMoney(n, currency, locale)
  const max = Math.max(1, ...st.income.map((x) => x.total), ...st.expenses.map((x) => x.total), st.fees)

  return (
    <section aria-labelledby="statement-title" className="min-w-0 rounded-3xl border bg-card p-5 sm:p-7">
      <h2 id="statement-title" className="text-xl font-bold">
        {r.statement}
      </h2>

      {st.review ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-sm text-warning">
          <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{t(r.notCounted, { n: st.review })}</span>
          <Link href={href(locale, "/app")} className="font-bold underline underline-offset-4">
            {r.reviewLink}
          </Link>
        </p>
      ) : null}

      {st.count === 0 ? (
        <p className="mt-6 text-muted-foreground">{r.emptyPeriod}</p>
      ) : (
        <>
          <h3 className="eyebrow mt-6 text-muted-foreground">{r.income}</h3>
          <ul className="mt-1 divide-y">
            {st.income.map((x) => (
              <StatementRow key={x.category} label={app.categories[x.category]} value={money(x.total)} ratio={x.total / max} count={x.count === 1 ? r.entry : t(r.entries, { n: x.count })} tone="income" />
            ))}
          </ul>
          <p className="flex justify-between border-t-2 border-foreground/80 py-2.5 font-bold">
            <span>{r.totalIncome}</span>
            <span className="tabular-nums">{money(st.totalIncome)}</span>
          </p>

          <h3 className="eyebrow mt-6 text-muted-foreground">{r.expenses}</h3>
          <ul className="mt-1 divide-y">
            {st.expenses.map((x) => (
              <StatementRow key={x.category} label={app.categories[x.category]} value={money(x.total)} ratio={x.total / max} count={x.count === 1 ? r.entry : t(r.entries, { n: x.count })} tone="expense" />
            ))}
            <StatementRow label={r.fees} value={money(st.fees)} ratio={st.fees / max} tone="expense" />
          </ul>
          <p className="flex justify-between border-t-2 border-foreground/80 py-2.5 font-bold">
            <span>{r.totalExpenses}</span>
            <span className="tabular-nums">{money(st.totalExpenses + st.fees)}</span>
          </p>

          <p className="mt-4 flex items-baseline justify-between rounded-2xl bg-muted px-4 py-3.5">
            <span className="font-bold">{r.net}</span>
            <span className={cn("text-2xl font-extrabold tabular-nums", st.net < 0 && "text-destructive")}>{money(st.net)}</span>
          </p>
          {st.internal ? <p className="mt-3 text-xs text-muted-foreground">{t(r.internal, { n: st.internal })}</p> : null}
        </>
      )}
    </section>
  )
}

function StatementRow({ label, value, ratio, count, tone }: { label: string; value: string; ratio: number; count?: string; tone: "income" | "expense" }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 py-2.5">
      <span className="min-w-0">
        {label}
        {count ? <span className="ml-2 text-xs text-muted-foreground">{count}</span> : null}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
      <span aria-hidden="true" className="col-span-2 h-1 overflow-hidden rounded-full bg-muted">
        <span className={cn("block h-full rounded-full", tone === "income" ? "bg-success/70" : "bg-chart-3/70")} style={{ width: `${Math.max(2, ratio * 100)}%` }} />
      </span>
    </li>
  )
}

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function ExportCard({ books, entries, period, currency, count }: { books: Books; entries: ReturnType<typeof classifyAll>; period: PeriodId; currency: Currency; count: number }) {
  const { app, locale } = useAppCopy()
  const x = app.report.export
  const journal = useMemo(() => journalOf(entries, books, period, currency, app.categories, app.report.accounts), [entries, books, period, currency, app])
  const base = `ledgerlift-${slug(books.name)}-${period}`
  const money = (n: number) => (n ? formatMoney(n, currency, locale) : "")

  return (
    <section aria-labelledby="export-title" className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id="export-title" className="text-xl font-bold">
        {x.title}
      </h2>
      {count === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{x.empty}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={() => download(`${base}-${app.report.files.ledger}.csv`, ledgerCsv(entries, books, period, currency, app.categories))}>
              <DownloadIcon aria-hidden="true" />
              {x.ledger}
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => download(`${base}-${app.report.files.journal}.csv`, journalCsv(journal, currency))}>
              <DownloadIcon aria-hidden="true" />
              {x.journal}
            </Button>
          </div>
          <Disclosure summary={x.preview} className="mt-4" contentClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-md text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">#</th>
                    <th scope="col" className="px-3 py-2 font-semibold">{x.account}</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">{x.debit}</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">{x.credit}</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.slice(0, 6).map((l, i) => (
                    <tr key={i} className={cn(i % 2 === 0 && "border-t")}>
                      <td className="px-3 py-1.5 text-muted-foreground tabular-nums">{l.no}</td>
                      <td className={cn("px-3 py-1.5", l.credit && "pl-7")}>{l.account}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{money(l.debit)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{money(l.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {journal.length > 6 ? <p className="border-t px-3 py-2 text-xs text-muted-foreground">{t(x.more, { n: journal.length - 6 })}</p> : null}
            </div>
          </Disclosure>
        </>
      )}
    </section>
  )
}

function SealCard({ books, entries, period, review, count }: { books: Books; entries: ReturnType<typeof classifyAll>; period: PeriodId; review: number; count: number }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const s = app.report.seal
  const tx = useTx()
  const fingerprint = useMemo(() => fingerprintOf(entries, books, period), [entries, books, period])
  const seals = books.seals.filter((x) => x.period === period)
  const latest = seals[0]
  const current = latest?.fingerprint === fingerprint
  const canSeal = review === 0 && count > 0 && !current

  async function seal() {
    if (demo?.wallet.status !== "connected") {
      const ok = await connectWallet({
        title: app.summaries.signIn,
        rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
        noFee: true,
      })
      if (!ok) return
    }
    await tx.run(
      {
        title: app.summaries.seal,
        rows: [
          { label: app.summaries.report, value: `${books.name} · ${app.period[period]}` },
          { label: app.summaries.entries, value: String(count) },
          { label: app.summaries.fingerprint, value: shortHash(fingerprint, 12, 10), mono: true },
        ],
        movesValue: true,
      },
      (hash, block) =>
        addSeal({ period, currency: demo?.prefs.currency ?? "USD", fingerprint, entries: count, hash, block, sealedAt: new Date().toISOString() })
    )
  }

  return (
    <section aria-labelledby="seal-title" className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id="seal-title" className="text-xl font-bold">
        {s.title}
      </h2>

      {latest ? (
        <div className={cn("ll-pop mt-4 flex items-start gap-3 rounded-2xl border-2 p-4", current ? "border-primary" : "border-dashed border-input")}>
          <StampIcon className={cn("mt-0.5 size-6 shrink-0", current ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-bold">{t(s.sealed, { block: formatBlock(latest.block, locale) })}</p>
            <p className="text-xs text-muted-foreground">{t(s.by, { date: formatDate(latest.sealedAt, locale), entries: latest.entries })}</p>
            <p className="mt-1 font-mono text-xs break-all text-muted-foreground" title={latest.fingerprint}>
              {s.fingerprint}: {shortHash(latest.fingerprint, 12, 10)}
            </p>
            <p className={cn("mt-2 text-xs font-bold", current ? "text-success" : "text-warning")}>{current ? s.current : s.stale}</p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
      )}

      {!current ? (
        <div className="mt-4 flex flex-col gap-3">
          {review > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t(s.needsReview, { n: review })}{" "}
              <Link href={href(locale, "/app")} className="font-semibold text-primary-ink underline underline-offset-4">
                {app.report.reviewLink}
              </Link>
            </p>
          ) : null}
          <Button onClick={() => void seal()} disabled={!canSeal || tx.busy} className="self-start">
            <StampIcon aria-hidden="true" />
            {s.button}
          </Button>
        </div>
      ) : null}

      <TxFeedback
        phase={tx.state.phase}
        hash={tx.state.hash}
        error={tx.state.error}
        hideConfirmed
        signingLabel={app.tx.signing}
        pendingLabel={app.tx.pending}
        pendingStatusLabel={app.tx.pending}
        confirmedLabel={app.tx.confirmed}
        failedLabel={app.tx.failed}
        reasons={{ rejected: app.tx.rejected, reverted: app.tx.reverted }}
        retryLabel={app.tx.retry}
        dismissLabel={app.tx.dismiss}
        className="mt-4"
        onRetry={() => {
          tx.reset()
          void seal()
        }}
        onDismiss={tx.reset}
      />

      {seals.length > 1 ? (
        <div className="mt-5">
          <h3 className="eyebrow text-muted-foreground">{s.history}</h3>
          <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
            {seals.slice(1, 4).map((x) => (
              <li key={x.id} className="flex justify-between gap-3 tabular-nums">
                <span>{t(s.sealed, { block: formatBlock(x.block, locale) })}</span>
                <span>{formatDate(x.sealedAt, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
