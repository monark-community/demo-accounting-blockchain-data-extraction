import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "LedgerLift by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const fr = locale === "fr"
  const rows = [
    { who: "Northbridge Foundation", cat: d.app.categories.grants, amt: fr ? "+15 000,00 tUSDC" : "+15,000.00 tUSDC", green: true },
    { who: "Léa Tremblay", cat: d.app.categories.payroll, amt: fr ? "−1 800,00 tUSDC" : "−1,800.00 tUSDC", green: false },
    { who: fr ? "Opérations" : "Operations", cat: d.app.categories.internal, amt: fr ? "−2 000,00 tUSDC" : "−2,000.00 tUSDC", green: false },
  ]

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>LedgerLift</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 460,
            alignSelf: "center",
            background: "#FFFEFC",
            border: "2px solid #E9DFD7",
            borderRadius: 32,
            padding: 28,
            gap: 4,
          }}
        >
          {rows.map((r, i) => (
            <div key={r.who} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 4px", borderTop: i ? "1px solid #E9DFD7" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{r.who}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, color: "#625952" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 9, background: r.green ? "#2f7a4a" : i === 2 ? "#625952" : "#7a5c3e" }} />
                  {r.cat}
                </span>
              </div>
              <span style={{ fontSize: 21, fontWeight: 700, color: r.green ? "#2f7a4a" : "#15110E" }}>{r.amt}</span>
            </div>
          ))}
          <div style={{ display: "flex", height: 4, background: "#F88D10", borderRadius: 4, marginTop: 8 }} />
        </div>
      </div>
    ),
    size
  )
}
