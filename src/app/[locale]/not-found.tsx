import Image from "next/image"
import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

export default async function NotFound() {
  const locale = await currentLocale()
  const c = getDictionary(locale).common
  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      {/* The brand kit names files by lettering colour: "-dark" has dark
          lettering (for the cream theme), "-light" has white lettering
          (for espresso). */}
      <Image src="/brand/monark-vertical-dark.svg" alt="Monark" width={120} height={120} unoptimized className="h-28 w-auto dark:hidden" />
      <Image src="/brand/monark-vertical-light.svg" alt="Monark" width={120} height={120} unoptimized className="hidden h-28 w-auto dark:block" />
      <p className="eyebrow mt-10 text-primary-ink">{c.notFound.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-display">{c.notFound.title}</h1>
      <p className="mt-4 text-muted-foreground">{c.notFound.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={href(locale)}>{c.notFound.home}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={href(locale, "/app")}>{c.notFound.demo}</Link>
        </Button>
      </div>
    </section>
  )
}
