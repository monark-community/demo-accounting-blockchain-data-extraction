"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, type ReactNode } from "react"

import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { classifyAll } from "@/lib/demo/classify"
import { inPeriod } from "@/lib/demo/prices"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

/**
 * App chrome under the site header: ONE compact bar with the two sections on
 * the left and the network + demo controls pill on the right. No testnet
 * strip: that line lives in the wallet prompt, once per transaction.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()

  return (
    <div className="flex flex-1 flex-col">
      <AppBar />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:py-8">
        {!demo ? <AppLoading label={app.loading} /> : children}
      </div>
    </div>
  )
}

function AppBar() {
  const demo = useDemo()
  const pathname = usePathname() ?? ""
  const { app, locale } = useAppCopy()
  const books = demo?.books ?? null
  const period = demo?.prefs.period ?? "q3"
  const review = useMemo(() => {
    if (!books) return 0
    return classifyAll(books).filter((e) => e.category === "review" && inPeriod(e.timestamp, period)).length
  }, [books, period])
  const items = [
    { href: href(locale, "/app"), label: app.nav.ledger, count: review },
    { href: href(locale, "/app/report"), label: app.nav.report, count: 0 },
  ]

  return (
    <div className="border-b bg-secondary/40">
      <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <nav aria-label={app.nav.label} className="min-w-0 flex-1">
          <ul className="flex items-center gap-1 py-2">
            {items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150",
                      active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {item.count ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                        <span aria-hidden="true">{item.count}</span>
                        <span className="sr-only">{t(app.nav.review, { n: item.count })}</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <DemoControls />
      </div>
    </div>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-64 animate-pulse rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
