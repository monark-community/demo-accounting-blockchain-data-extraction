"use client"

import { CheckIcon, Loader2Icon, RotateCcwIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { classify, nameOf } from "@/lib/demo/classify"
import { STAGES, type ExtractState } from "@/lib/demo/extract"
import type { Books } from "@/lib/demo/types"
import { formatBlock, formatDay, formatToken, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { CategoryChip } from "./bits"

/**
 * The extraction in progress: stages, a block counter and the latest
 * transactions landing as readable ledger lines (signature moment 1).
 */
export function ExtractionPanel({
  state,
  name,
  books,
  onRetry,
  onCancel,
  compact = false,
}: {
  state: ExtractState
  name: string
  books: Books | null
  onRetry: () => void
  onCancel: () => void
  compact?: boolean
}) {
  const { app, locale } = useAppCopy()
  const x = app.extract
  const failed = state.phase === "failed"
  const span = Math.max(1, state.toBlock - state.fromBlock)
  const pct = Math.round(((state.block - state.fromBlock) / span) * 100)
  // Classify previews against the books they'll join (or a bare one-wallet view).
  const view: Books = books ?? {
    name,
    sample: null,
    wallets: [{ address: state.address, name }],
    entries: [],
    rules: [],
    labels: {},
    dismissed: [],
    seals: [],
    combined: null,
  }

  return (
    <section
      aria-labelledby="extract-title"
      className={cn("w-full rounded-3xl border bg-card p-5 sm:p-7", compact ? "" : "mx-auto max-w-2xl")}
    >
      <div className="flex items-center gap-3">
        <WalletAvatar address={state.address} size={36} />
        <div className="min-w-0">
          <h2 id="extract-title" className="truncate text-lg font-extrabold">
            {t(x.title, { name })}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">{shortAddress(state.address)}</p>
        </div>
      </div>

      <ol className="mt-6 grid gap-2 sm:grid-cols-4">
        {STAGES.map((stage, i) => {
          const done = state.stage > i || state.phase === "done"
          const active = state.stage === i && !done
          return (
            <li
              key={stage}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold sm:flex-col sm:items-start sm:gap-1.5",
                done || active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && !failed && "border-primary",
                  active && failed && "border-destructive text-destructive"
                )}
              >
                {done ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} aria-hidden="true" />
                ) : active && failed ? (
                  <XCircleIcon className="size-3.5" aria-hidden="true" />
                ) : active ? (
                  <Loader2Icon className="size-3.5 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </span>
              {x.stages[stage]}
            </li>
          )
        })}
      </ol>

      <div className="mt-6">
        <div
          role="progressbar"
          aria-label={x.stages.blocks}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className={cn("h-full rounded-full transition-[width] duration-150 ease-out", failed ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-xs text-muted-foreground tabular-nums">
          <span>{t(x.progress, { block: formatBlock(state.block, locale), to: formatBlock(state.toBlock, locale) })}</span>
          <span aria-live="polite">{t(x.found, { n: state.found })}</span>
        </div>
      </div>

      {state.preview.length ? (
        <div className="mt-6">
          <h3 className="eyebrow text-muted-foreground">{x.latest}</h3>
          <ul className="mt-2 divide-y rounded-2xl border">
            {state.preview.map((raw) => {
              const e = classify(raw, view)
              const who = nameOf(e.counterparty, view) ?? shortAddress(e.counterparty)
              return (
                <li key={e.hash} className="ll-in flex items-center gap-3 px-3.5 py-2.5 text-sm">
                  <span className="w-14 shrink-0 text-xs text-muted-foreground tabular-nums">{formatDay(e.timestamp, locale)}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{who}</span>
                  <CategoryChip category={e.category} label={app.categories[e.category]} className="hidden sm:inline-flex" />
                  <span className="shrink-0 text-right font-mono text-xs tabular-nums">
                    {e.direction === "in" ? "+" : "−"}
                    {formatToken(e.amount, e.token, locale)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div aria-live="assertive">
        {failed && state.failedAt ? (
          <div role="alert" className="mt-6 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm">
              <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              {t(x.failed, { block: formatBlock(state.failedAt, locale) })}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="ghost" onClick={onCancel}>
                {x.cancel}
              </Button>
              <Button size="sm" onClick={onRetry} autoFocus>
                <RotateCcwIcon aria-hidden="true" />
                {x.retry}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {!failed && state.phase === "running" ? (
        <div className="mt-6 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {x.cancel}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
