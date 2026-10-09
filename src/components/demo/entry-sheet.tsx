"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Disclosure } from "@/components/ui/disclosure"
import { InfoTip } from "@/components/ui/info-tip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { EXPENSES, INCOME, isOwnWallet, nameOf } from "@/lib/demo/classify"
import { sameAddress } from "@/lib/demo/network"
import { categorize } from "@/lib/demo/ops"
import { FX, priceOn } from "@/lib/demo/prices"
import { feeValueOf, valueOf } from "@/lib/demo/report"
import type { Books, CategoryId, Currency, Entry, TokenSymbol } from "@/lib/demo/types"
import { formatBlock, formatDateTime, formatMoney, formatNumber, formatToken, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { CategoryChip } from "./bits"

const DECIMALS: Record<TokenSymbol, number> = { tETH: 18, tUSDC: 6, tDAI: 18, tLINK: 18 }

/** Token units as the chain stores them (base units), from a decimal amount. */
function baseUnits(amount: number, token: TokenSymbol): string {
  const [whole = "0", frac = ""] = String(amount).split(".")
  const d = DECIMALS[token]
  const units = `${whole}${frac.padEnd(d, "0").slice(0, d)}`.replace(/^0+(?=\d)/, "")
  return units || "0"
}

function methodSignature(e: Entry): string {
  if (e.method === "swap") return "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
  if (e.method === "approve") return "approve(address,uint256)"
  return e.token === "tETH" ? "— (native transfer)" : "transfer(address,uint256)"
}

/**
 * One entry, lifted: amount, value and category up top; the raw transaction
 * behind "On-chain details". Saving changes one entry or, with the box
 * ticked, creates a rule for every entry from the same address.
 */
export function EntrySheet({
  entry,
  books,
  entries,
  currency,
  onClose,
  onSaved,
}: {
  entry: Entry | null
  books: Books
  entries: Entry[]
  currency: Currency
  onClose: () => void
  onSaved: (hash: string) => void
}) {
  const { app } = useAppCopy()
  return (
    <Sheet open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" closeLabel={app.close} className="sm:max-w-md">
        {entry ? <SheetBody key={entry.hash} entry={entry} books={books} entries={entries} currency={currency} onClose={onClose} onSaved={onSaved} /> : null}
      </SheetContent>
    </Sheet>
  )
}

function SheetBody({
  entry: e,
  books,
  entries,
  currency,
  onClose,
  onSaved,
}: {
  entry: Entry
  books: Books
  entries: Entry[]
  currency: Currency
  onClose: () => void
  onSaved: (hash: string) => void
}) {
  const { app, locale } = useAppCopy()
  const s = app.sheet
  const own = isOwnWallet(e.counterparty, books)
  const who = nameOf(e.counterparty, books)
  const sameCount = entries.filter((x) => sameAddress(x.counterparty, e.counterparty)).length
  const existingLabel = Object.entries(books.labels).find(([k]) => sameAddress(k, e.counterparty))?.[1] ?? ""

  const [category, setCategory] = useState<CategoryId>(e.category === "review" ? (e.direction === "in" ? "otherIncome" : "otherExpense") : e.category)
  const [label, setLabel] = useState(existingLabel)
  const [applyAll, setApplyAll] = useState(sameCount > 1 && !own)
  const [picked, setPicked] = useState(e.category !== "review")

  const groups: { title: string; items: CategoryId[] }[] = [
    { title: app.kinds.income, items: INCOME },
    { title: app.kinds.expense, items: EXPENSES },
    { title: app.kinds.neutral, items: ["internal", "swap", "fees"] },
  ]
  const fee = feeValueOf(e, currency)
  const price = priceOn(e.token, e.timestamp) * FX[currency]
  const from = e.direction === "in" ? e.counterparty : e.wallet
  const to = e.direction === "in" ? e.wallet : e.counterparty

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(ev) => {
        ev.preventDefault()
        categorize(e.hash, category, { rule: applyAll, label: own ? undefined : label })
        onSaved(e.hash)
      }}
    >
      <SheetHeader className="gap-1 border-b px-5 py-4 pr-14">
        <SheetDescription className="text-xs">
          {e.direction === "in" ? app.table.in : e.method === "swap" ? app.table.swap : app.table.out} · {formatDateTime(e.timestamp, locale)}
        </SheetDescription>
        <SheetTitle className="truncate text-xl">{who ?? shortAddress(e.counterparty)}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={cn("font-mono text-2xl font-semibold tabular-nums", e.direction === "in" && "text-success")}>
              {e.method === "approve" ? "—" : `${e.direction === "in" ? "+" : "−"}${formatToken(e.amount, e.token, locale)}`}
            </p>
            {e.received ? (
              <p className="font-mono text-sm text-muted-foreground tabular-nums">
                {s.received}: +{formatToken(e.received.amount, e.received.token, locale)}
              </p>
            ) : null}
          </div>
          <div className="text-right text-sm tabular-nums">
            {e.method !== "approve" ? <p className="font-bold">{formatMoney(valueOf(e, currency), currency, locale)}</p> : null}
            {fee ? <p className="text-xs text-muted-foreground">{t(app.table.fee, { value: formatMoney(fee, currency, locale) })}</p> : null}
          </div>
        </div>

        <fieldset className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <legend className="text-sm font-bold">{s.category}</legend>
            <InfoTip label={s.how}>
              <p>{s.howBody}</p>
              <Link href={href(locale, "/how-it-works")} className="mt-2 inline-block font-semibold text-primary-ink underline underline-offset-4">
                {s.howLink}
              </Link>
            </InfoTip>
          </div>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {t(s.source, { source: app.sources[e.source] })}
            {e.category === "review" ? <CategoryChip category="review" label={app.categories.review} /> : null}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {groups.map((g) => (
              <div key={g.title} role="radiogroup" aria-label={g.title}>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{g.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((c) => {
                    const checked = picked && category === c
                    return (
                      <label
                        key={c}
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold transition-colors duration-150 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          checked ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
                        )}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={c}
                          checked={checked}
                          onChange={() => {
                            setCategory(c)
                            setPicked(true)
                          }}
                          className="sr-only"
                        />
                        {app.categories[c]}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {!own ? (
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <Label htmlFor="entry-label">
                {s.label}
              </Label>
              <Input
                id="entry-label"
                value={label}
                onChange={(ev) => setLabel(ev.target.value)}
                placeholder={who ?? s.labelPlaceholder}
                maxLength={48}
                className="mt-2 rounded-full px-4"
              />
            </div>
            {sameCount > 1 ? (
              <div className="flex items-start gap-3">
                <Checkbox id="apply-all" checked={applyAll} onCheckedChange={(v) => setApplyAll(v === true)} className="mt-0.5" />
                <Label htmlFor="apply-all" className="text-sm leading-snug font-semibold">
                  {t(s.applyAll, { n: sameCount })}
                </Label>
              </div>
            ) : null}
          </div>
        ) : null}

        <Disclosure summary={s.onchain} className="mt-6" contentClassName="p-0">
          <dl className="divide-y text-xs">
            {[
              { k: s.hash, v: e.hash, mono: true },
              { k: s.block, v: formatBlock(e.block, locale) },
              { k: s.method, v: methodSignature(e), mono: true },
              { k: s.from, v: from, mono: true },
              { k: s.to, v: to, mono: true },
              { k: s.raw, v: `${baseUnits(e.amount, e.token)} (${DECIMALS[e.token]} decimals)`, mono: true },
              { k: s.gas, v: t(s.gasValue, { used: formatNumber(e.gasUsed, locale, 0), price: formatNumber(e.gasPriceGwei, locale) }) },
              { k: s.price, v: `${formatMoney(price, currency, locale)} / ${e.token}` },
              ...(fee ? [{ k: s.fee, v: `${e.feeEth.toFixed(8)} tETH · ${formatMoney(fee, currency, locale)}`, mono: true }] : []),
            ].map((row) => (
              <div key={row.k} className="grid grid-cols-[6.5rem_1fr] gap-3 px-4 py-2.5">
                <dt className="text-muted-foreground">{row.k}</dt>
                <dd className={cn("min-w-0 break-all", row.mono && "font-mono")}>{row.v}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      </div>

      <SheetFooter className="flex-row justify-end gap-2 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="ghost" onClick={onClose}>
          {s.cancel}
        </Button>
        <Button type="submit" disabled={!picked}>
          {s.save}
        </Button>
      </SheetFooter>
    </form>
  )
}
