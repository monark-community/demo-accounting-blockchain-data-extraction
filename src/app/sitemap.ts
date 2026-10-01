import type { MetadataRoute } from "next"

import { locales, SITE_URL } from "@/i18n/config"

// /pricing is deliberately absent: it is an unlinked internal-review page.
const PATHS = ["", "/how-it-works", "/app", "/app/report", "/credits"]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    }))
  )
}
