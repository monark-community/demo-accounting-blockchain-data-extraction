import { ArrowRightIcon, DatabaseIcon, FileCode2Icon, FileSpreadsheetIcon, TagsIcon, TrendingUpIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CategoryChip } from "@/components/demo/category-chip"
import { SectionDivider } from "@/components/ui/section-divider"
import { Button } from "@/components/ui/button"
import { Disclosure } from "@/components/ui/disclosure"
import { SectionHeading } from "@/components/ui/section-heading"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const QUERY = `query WalletHistory($wallet: Bytes!, $from: BigInt!, $to: BigInt!) {
  transfers(
    where: { or: [{ from: $wallet }, { to: $wallet }],
             blockNumber_gte: $from, blockNumber_lte: $to }
    orderBy: blockNumber
    first: 1000
  ) {
    transactionHash  blockNumber  timestamp
    from  to  value
    token { symbol decimals }
    transaction { gasUsed gasPrice input }
  }
}`

const COLUMNS = [
  "date_utc",
  "wallet",
  "direction",
  "counterparty",
  "counterparty_address",
  "category",
  "category_source",
  "token",
  "amount",
  "price_usd",
  "value_usd",
  "fee_teth",
  "fee_usd",
  "tx_hash",
  "block",
]

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const stepIcons = [DatabaseIcon, FileCode2Icon, TrendingUpIcon, TagsIcon, FileSpreadsheetIcon]

  return (
    <div className="flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 sm:px-6 lg:pt-20">
        <h1 className="text-4xl font-extrabold tracking-display sm:text-5xl">{h.title}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">{h.intro}</p>
      </header>

      {/* The pipeline: five steps joined by a flat orange line. */}
      <section aria-label={h.title} className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
          <span aria-hidden="true" className="absolute top-6 right-[10%] left-[10%] hidden h-0.5 bg-primary md:block" />
          <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-0.5 bg-primary md:hidden" />
          {h.steps.map((step, i) => {
            const Icon = stepIcons[i]!
            return (
              <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <Icon className="size-5 text-foreground" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="text-lg font-bold">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <SectionDivider contained />

      {/* How an entry gets its category */}
      <section aria-labelledby="cat-title" className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <SectionHeading titleId="cat-title" title={h.categories.title} lead={h.categories.sub} />
        <div className="mt-8 overflow-hidden rounded-3xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="w-16 px-4 py-3 font-semibold">
                  {h.categories.head.rank}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {h.categories.head.when}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {h.categories.head.result}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {h.categories.rows.map((row, i) => (
                <tr key={row.when}>
                  <td className="px-4 py-3 font-bold tabular-nums">{i < 5 ? i + 1 : "—"}</td>
                  <td className="px-4 py-3">{row.when}</td>
                  <td className="px-4 py-3">
                    {i === 2 ? (
                      <CategoryChip category="internal" label={row.result} />
                    ) : i === 5 ? (
                      <CategoryChip category="review" label={row.result} />
                    ) : (
                      <span className="text-muted-foreground">{row.result}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Own wallets, prices, seal */}
      <section className="border-y bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-bold">{h.own.title}</h2>
            <p className="mt-2 text-muted-foreground">{h.own.body}</p>
            <OwnWalletsDiagram labels={h.own} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{h.prices.title}</h2>
            <p className="mt-2 text-muted-foreground">{h.prices.body}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{h.seal.title}</h2>
            <p className="mt-2 text-muted-foreground">{h.seal.body}</p>
          </div>
        </div>
      </section>

      {/* Developers */}
      <section aria-labelledby="dev-title" className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <SectionHeading titleId="dev-title" title={h.dev.title} lead={h.dev.body} />
        <Disclosure summary={h.dev.toggle} className="mt-6" contentClassName="px-5 py-5">
          <div>
            <h3 className="text-sm font-bold">{h.dev.query}</h3>
            <pre className="mt-2 overflow-x-auto rounded-2xl bg-muted p-4 text-xs leading-relaxed">
              <code>{QUERY}</code>
            </pre>
            <h3 className="mt-6 text-sm font-bold">{h.dev.columns}</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {COLUMNS.map((c) => (
                <li key={c} className="rounded-full border px-2.5 py-0.5 font-mono text-xs">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Disclosure>
      </section>

      <section className="border-t bg-card/60">
        <SectionHeading
          title={h.cta.title}
          className="mx-auto max-w-6xl gap-6 px-4 py-14 sm:px-6 md:items-center"
          action={
            <Button asChild size="lg">
              <Link href={href(locale, "/app?sample=campus")}>
                {h.cta.button}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          }
        />
      </section>
    </div>
  )
}

/** Line art: two wallets joined by a transfer that stays out of the totals. */
function OwnWalletsDiagram({ labels }: { labels: { treasury: string; operations: string; transfer: string; excluded: string } }) {
  return (
    <figure className="mt-6">
      <svg viewBox="0 0 320 120" className="w-full max-w-sm" role="img" aria-label={`${labels.treasury} → ${labels.operations}: ${labels.transfer}. ${labels.excluded}.`}>
        <g fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="20" width="96" height="44" rx="22" />
          <rect x="220" y="20" width="96" height="44" rx="22" />
          <path d="M104 42h108" />
          <path d="M204 36l8 6-8 6" />
          <path d="M60 64v24a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8V64" strokeDasharray="3 5" />
        </g>
        <g fill="var(--foreground)" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="inherit">
          <text x="52" y="46.5">{labels.treasury}</text>
          <text x="268" y="46.5">{labels.operations}</text>
        </g>
        <text x="158" y="32" fill="var(--muted-foreground)" fontSize="11.5" textAnchor="middle" fontFamily="ui-monospace, monospace">
          {labels.transfer}
        </text>
        <text x="160" y="114" fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" fontFamily="inherit">
          {labels.excluded}
        </text>
      </svg>
    </figure>
  )
}
