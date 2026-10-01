import Image from "next/image"
import Link from "next/link"

import { href, projectDocUrl, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

const SOCIALS = [
  { key: "discord", url: "https://discord.gg/TvhrbFCp8T" },
  { key: "github", url: "https://github.com/monark-community" },
  { key: "linkedin", url: "https://www.linkedin.com/company/monark-io/about/" },
  { key: "twitter", url: "https://x.com/monark_io" },
  { key: "youtube", url: "https://www.youtube.com/@monark_io" },
] as const

/**
 * Standard Monark three-band footer (brand guidelines §10). The legal band
 * carries "Demo · simulated data" only; the testnet line lives in the wallet
 * prompt, once per transaction (§11).
 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const f = c.footer
  const year = new Date().getFullYear()
  const links = [
    { href: href(locale), label: c.nav.overview },
    { href: href(locale, "/how-it-works"), label: c.nav.how },
    { href: href(locale, "/app"), label: c.nav.demo },
    { href: href(locale, "/credits"), label: c.nav.credits },
  ]
  const projectUrl = projectDocUrl(locale)

  return (
    <footer className="mt-auto border-t bg-background">
      {/* Band 1: product */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:items-start">
        <div className="max-w-md">
          <p className="text-lg font-extrabold">{c.product}</p>
          <p className="mt-2 text-sm text-muted-foreground">{f.product}</p>
        </div>
        <nav aria-label={f.productNav}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline-offset-4 hover:underline md:min-h-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Band 2: Monark */}
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{f.builtBy}</p>
            <a href="https://www.monark.io" aria-label={f.monarkHome} className="w-fit p-2 -m-2">
              <Image src="/brand/monark-horizontal-light.svg" alt="Monark" width={150} height={40} unoptimized className="h-9 w-auto dark:hidden" />
              <Image src="/brand/monark-horizontal-dark.svg" alt="Monark" width={150} height={40} unoptimized className="hidden h-9 w-auto dark:block" />
            </a>
            <p className="text-sm text-muted-foreground">{f.tagline}</p>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <li>
                <a href={projectUrl} className="inline-flex min-h-11 items-center text-primary-ink underline underline-offset-4 md:min-h-0">
                  {f.projectPage}
                </a>
              </li>
              <li>
                <a href={REPO_URL} className="inline-flex min-h-11 items-center text-primary-ink underline underline-offset-4 md:min-h-0">
                  {f.repo}
                </a>
              </li>
            </ul>
            <ul aria-label={f.socialLabel} className="flex items-center gap-1">
              {SOCIALS.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.url}
                    aria-label={f.social[s.key]}
                    title={f.social[s.key]}
                    className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                  >
                    {/* Monark's social SVGs, recoloured to foreground through a mask for contrast. */}
                    <span
                      aria-hidden="true"
                      className="size-6 bg-current"
                      style={{
                        maskImage: `url(/brand/socials/${s.key}.svg)`,
                        WebkitMaskImage: `url(/brand/socials/${s.key}.svg)`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                      }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Band 3: legal */}
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row md:flex-wrap md:items-center md:gap-x-4">
          <span>
            © {year} {f.legal}
          </span>
          <span aria-hidden="true" className="hidden md:inline">·</span>
          <span className="font-semibold text-foreground">{c.demoBadge}</span>
          <span aria-hidden="true" className="hidden md:inline">·</span>
          <Link href={href(locale, "/credits")} className="underline underline-offset-4 hover:text-foreground">
            {f.photos}
          </Link>
        </div>
      </div>
    </footer>
  )
}
