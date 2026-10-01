"use client"

import { useEffect, useState } from "react"

import { CategoryChip } from "@/components/demo/category-chip"
import type { CategoryId } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export interface LiftExample {
  raw: { hash: string; from: string; to: string; call: string; value: string }
  line: { date: string; verb: string; who: string; category: CategoryId; categoryLabel: string; amount: string; value: string; fee: string | null; incoming: boolean }
}

/**
 * The hero visual: a raw on-chain transaction and, under it, the same
 * transaction lifted into a readable ledger line. It steps through three
 * examples once, then stays; the dots pick one directly.
 */
export function LiftCard({ examples, labels }: { examples: LiftExample[]; labels: { label: string; raw: string; lifted: string; pick: string } }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    if (i >= examples.length - 1) return
    const id = setTimeout(() => setI((n) => n + 1), 3600)
    return () => clearTimeout(id)
  }, [i, auto, examples.length])

  const ex = examples[i]!
  return (
    <figure aria-label={labels.label} className="relative w-full max-w-md rounded-3xl border bg-card p-4 sm:p-5">
      <figcaption className="sr-only">{labels.label}</figcaption>
      <div className="rounded-2xl border border-dashed bg-muted/40 p-3.5">
        <p className="eyebrow text-muted-foreground">{labels.raw}</p>
        <dl key={`raw-${i}`} className="ll-in mt-2 grid grid-cols-[3.25rem_1fr] gap-x-2 gap-y-1 font-mono text-[0.72rem] leading-relaxed text-muted-foreground">
          <dt>hash</dt>
          <dd className="truncate text-foreground">{ex.raw.hash}</dd>
          <dt>from</dt>
          <dd className="truncate">{ex.raw.from}</dd>
          <dt>to</dt>
          <dd className="truncate">{ex.raw.to}</dd>
          <dt>call</dt>
          <dd className="truncate">{ex.raw.call}</dd>
          <dt>value</dt>
          <dd className="truncate text-foreground">{ex.raw.value}</dd>
        </dl>
      </div>

      {/* The lift: a short orange connector. */}
      <div aria-hidden="true" className="flex h-8 items-center justify-center">
        <svg width="16" height="32" viewBox="0 0 16 32" fill="none" className="text-primary">
          <circle cx="8" cy="4" r="3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 8v18M3.5 21.5 8 26l4.5-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="rounded-2xl border-2 border-primary bg-card p-3.5">
        <p className="eyebrow text-primary-ink">{labels.lifted}</p>
        <div key={`line-${i}`} className="ll-lift mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {ex.line.date} · {ex.line.verb}
            </p>
            <p className="truncate font-bold">{ex.line.who}</p>
            <CategoryChip category={ex.line.category} label={ex.line.categoryLabel} className="mt-1.5" />
          </div>
          <div className="shrink-0 text-right">
            <p className={cn("font-mono text-sm font-semibold tabular-nums", ex.line.incoming && "text-success")}>{ex.line.amount}</p>
            <p className="text-sm tabular-nums">{ex.line.value}</p>
            {ex.line.fee ? <p className="text-xs text-muted-foreground tabular-nums">{ex.line.fee}</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1">
        {examples.map((_, n) => (
          <button
            key={n}
            type="button"
            aria-label={`${labels.pick} ${n + 1}`}
            aria-pressed={n === i}
            onClick={() => {
              setAuto(false)
              setI(n)
            }}
            className="flex size-8 items-center justify-center rounded-full"
          >
            <span className={cn("block h-1.5 rounded-full transition-all duration-200", n === i ? "w-5 bg-primary" : "w-1.5 bg-input")} />
          </button>
        ))}
      </div>
    </figure>
  )
}
