import { ArrowRightIcon, FileSpreadsheetIcon, LayersIcon, LinkIcon, StampIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CategoryChip } from "@/components/demo/category-chip"
import { LiftCard, type LiftExample } from "@/components/home/lift-card"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary, type Dictionary } from "@/i18n"
import { classify, nameOf } from "@/lib/demo/classify"
import { seededHash } from "@/lib/demo/ids"
import { feeValueOf, valueOf } from "@/lib/demo/report"
import { historyOf, SAMPLES } from "@/lib/demo/seed"
import type { Books, CategoryId } from "@/lib/demo/types"
import { formatDay, formatMoney, formatToken, shortAddress } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, d.description)
}

const DECIMALS = { tETH: 18, tUSDC: 6, tDAI: 18, tLINK: 18 } as const

/** Three real entries from the sample treasury, as raw transactions and as ledger lines. */
function liftExamples(locale: Locale, dict: Dictionary): LiftExample[] {
  const s = SAMPLES.campus
  const books: Books = { name: s.books, sample: "campus", wallets: [s.wallet], entries: [], rules: [], labels: {}, dismissed: [], seals: [], combined: null }
  const txs = historyOf(s.wallet.address)
  const a = dict.app
  return ["pay-lea-9", "grant-jul", "swap-aug"].flatMap((key) => {
    const raw = txs.find((x) => x.hash === seededHash(key))
    if (!raw) return []
    const e = classify(raw, books)
    const [whole = "0", frac = ""] = String(e.amount).split(".")
    const units = `${whole}${frac.padEnd(DECIMALS[e.token], "0")}`.replace(/^0+(?=\d)/, "")
    const fee = feeValueOf(e, "USD")
    const from = e.direction === "in" ? e.counterparty : e.wallet
    const to = e.direction === "in" ? e.wallet : e.counterparty
    return [
      {
        raw: {
          hash: `${e.hash.slice(0, 18)}…${e.hash.slice(-6)}`,
          from: shortAddress(from),
          to: shortAddress(to),
          call: e.method === "swap" ? "swapExactTokensForTokens(…)" : "transfer(address,uint256)",
          value: `${units} (${e.token})`,
        },
        line: {
          date: formatDay(e.timestamp, locale),
          verb: e.method === "swap" ? a.table.swap : e.direction === "in" ? a.table.in : a.table.out,
          who: nameOf(e.counterparty, books) ?? shortAddress(e.counterparty),
          category: e.category,
          categoryLabel: a.categories[e.category],
          amount: `${e.direction === "in" ? "+" : "−"}${formatToken(e.amount, e.token, locale)}`,
          value: formatMoney(valueOf(e, "USD"), "USD", locale),
          fee: fee ? `${dict.home.lift.fee} ${formatMoney(fee, "USD", locale)}` : null,
          incoming: e.direction === "in",
        },
      },
    ]
  })
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const cats = dict.app.categories
  const appHref = href(locale, "/app?sample=campus")
  const icons = [LayersIcon, LinkIcon, FileSpreadsheetIcon]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* The site's one mesh butterfly, large and cropped behind the lift card. */}
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={900}
          height={900}
          unoptimized
          priority
          className="pointer-events-none absolute top-1/2 -right-64 hidden w-[56rem] max-w-none -translate-y-1/2 opacity-[0.13] select-none lg:block"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <h1 className="text-[2.25rem] leading-[1.08] font-extrabold tracking-display text-balance sm:text-6xl lg:text-[4rem]">{h.hero.title}</h1>
            <p className="mt-6 max-w-[34rem] text-lg text-muted-foreground sm:text-xl">{h.hero.sub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={appHref}>
                  {h.hero.cta}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.hero.secondary}</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <LiftCard examples={liftExamples(locale, dict)} labels={{ label: h.lift.label, raw: h.lift.raw, lifted: h.lift.lifted, pick: h.lift.pick }} />
          </div>
        </div>
      </section>

      {/* Books you can hand over */}
      <section aria-labelledby="features-title" className="border-t bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="features-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.features.title}
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {h.features.items.map((item, i) => {
              const Icon = icons[i]!
              return (
                <li key={item.title} className="flex flex-col rounded-3xl border bg-card p-6">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                  <div aria-hidden="true" className="mt-6 flex min-h-24 flex-1 items-end">
                    {i === 0 ? <ChipsFragment labels={cats} /> : i === 1 ? <OwnWalletsFragment dict={dict} /> : <FilesFragment dict={dict} />}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* For whoever keeps the books */}
      <section aria-labelledby="who-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="who-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {h.who.items.map((item, i) => {
            const photo = PHOTOS[i]!
            return (
              <li key={item.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border">
                  <Image src={photo.file} alt={item.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-muted-foreground">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <SectionDivider />

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="faq-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.faq.title}
        </h2>
        <div className="mt-8 divide-y rounded-3xl border bg-card">
          {h.faq.items.map((item) => (
            <details key={item.q} className="group px-5 sm:px-6">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-xl leading-none text-primary transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="border-t bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-20">
          <h2 className="text-3xl font-bold tracking-display sm:text-[2rem]">{h.closing.title}</h2>
          <Button asChild size="lg">
            <Link href={appHref}>
              {h.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function ChipsFragment({ labels }: { labels: Record<CategoryId, string> }) {
  const chips: CategoryId[] = ["grants", "payroll", "swap", "fees", "review"]
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <CategoryChip key={c} category={c} label={labels[c]} />
      ))}
    </div>
  )
}

function OwnWalletsFragment({ dict }: { dict: Dictionary }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-xs font-bold">
        <span className="rounded-full border px-2.5 py-1">{dict.home.features.treasury}</span>
        <svg viewBox="0 0 80 12" className="h-3 flex-1 text-primary" preserveAspectRatio="none" fill="none">
          <circle cx="4" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 6h64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="76" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="rounded-full border px-2.5 py-1">{dict.home.features.operations}</span>
      </div>
      <div className="mt-3 flex justify-center">
        <CategoryChip category="internal" label={dict.app.categories.internal} />
      </div>
    </div>
  )
}

function FilesFragment({ dict }: { dict: Dictionary }) {
  const f = dict.app.report.files
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex gap-2">
        {[f.ledger, f.journal].map((name) => (
          <span key={name} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs">
            <FileSpreadsheetIcon className="size-3.5 text-primary" aria-hidden="true" />
            {name}.csv
          </span>
        ))}
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-primary px-2.5 py-1 text-xs font-bold">
        <StampIcon className="size-3.5 text-primary" aria-hidden="true" />
        {dict.home.features.sealed}
      </span>
    </div>
  )
}
