import type { Metadata } from "next"

import type { Locale } from "@/i18n/config"

/** Per-page metadata with canonical URL and hreflang alternates for both locales. */
export function pageMetadata(locale: Locale, path: string, title: string | null, description: string): Metadata {
  const suffix = path === "/" ? "" : path
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: { en: `/en${suffix}`, fr: `/fr${suffix}`, "x-default": `/en${suffix}` },
    },
    openGraph: {
      type: "website",
      siteName: "LedgerLift by Monark",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}${suffix}`,
      description,
      ...(title ? { title } : {}),
    },
  }
}
