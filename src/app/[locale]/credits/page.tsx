import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.credits
  return pageMetadata(locale, "/credits", m.title, m.description)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const c = dict.credits
  const alts = dict.home.who.items.map((i) => i.alt)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl font-extrabold tracking-display sm:text-5xl">{c.title}</h1>
      <p className="mt-4 max-w-[68ch] text-lg text-muted-foreground">
        {c.intro}{" "}
        <a href="https://unsplash.com/license" className="font-semibold text-primary-ink underline underline-offset-4">
          unsplash.com/license
        </a>
      </p>

      <section className="mt-12" aria-labelledby="photos-title">
        <h2 id="photos-title" className="text-2xl font-bold">
          {c.photos}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {PHOTOS.map((p, i) => (
            <li key={p.file} className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-[4/3]">
                <Image src={p.file} alt={alts[i] ?? ""} fill sizes="(min-width: 640px) 30vw, 100vw" className="object-cover" />
              </div>
              <div className="p-4 text-sm">
                <p>
                  <a href={p.page} className="font-bold text-primary-ink underline underline-offset-4">
                    {t(c.photoBy, { name: p.photographer })}
                  </a>
                </p>
                <p className="mt-1 break-all text-muted-foreground">
                  <a href={p.profile} className="underline underline-offset-4 hover:text-foreground">
                    {p.profile.replace("https://", "")}
                  </a>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t(c.usedFor, { use: c.uses[i] ?? "" })}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="type-title">
        <h2 id="type-title" className="text-2xl font-bold">
          {c.type}
        </h2>
        <p className="mt-2 max-w-[68ch] text-muted-foreground">{c.typeBody}</p>
      </section>

      <section className="mt-12" aria-labelledby="brand-title">
        <h2 id="brand-title" className="text-2xl font-bold">
          {c.brand}
        </h2>
        <p className="mt-2 max-w-[68ch] text-muted-foreground">{c.brandBody}</p>
      </section>
    </div>
  )
}
