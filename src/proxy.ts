import { NextResponse, type NextRequest } from "next/server"

import { defaultLocale, isLocale, type Locale } from "@/i18n/config"

/** Pick the visitor's preferred supported language from Accept-Language (fallback English). */
function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? ""
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", q] = part.trim().split(";q=")
      return { lang: tag.toLowerCase().split("-")[0] ?? "", q: q ? Number(q) : 1 }
    })
    .filter((x) => x.lang && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q)
  for (const { lang } of ranked) if (isLocale(lang)) return lang
  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split("/")[1] ?? ""
  if (isLocale(first)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Next internals, metadata routes and static files (anything with a dot).
  matcher: ["/((?!_next|api|sitemap.xml|robots.txt|icon|apple-icon|.*\\..*).*)"],
}

