import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"

import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"
import { ThemeProvider } from "@/components/site/theme"
import { isLocale, locales, SITE_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    applicationName: "LedgerLift",
    openGraph: {
      type: "website",
      siteName: "LedgerLift by Monark",
      title: d.title,
      description: d.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0b02" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={nunito.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {dict.common.skip}
          </a>
          <SiteHeader locale={locale} dict={dict} />
          <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} dict={dict} />
        </ThemeProvider>
      </body>
    </html>
  )
}
