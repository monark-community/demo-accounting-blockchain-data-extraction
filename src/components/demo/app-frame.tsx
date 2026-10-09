"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, type ReactNode } from "react"
import { toast } from "sonner"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { DemoControls } from "@/components/ui/demo-controls"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { classifyAll } from "@/lib/demo/classify"
import { NETWORK_NAME } from "@/lib/demo/network"
import { inPeriod } from "@/lib/demo/prices"
import { resetDemo, setSettings, useDemo, useStorageOk } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"

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
  const c = app.controls
  const books = demo?.books ?? null
  const period = demo?.prefs.period ?? "q3"
  const review = useMemo(() => {
    if (!books) return 0
    return classifyAll(books).filter((e) => e.category === "review" && inPeriod(e.timestamp, period)).length
  }, [books, period])

  return (
    <AppTabs
      tabs={[
        { href: href(locale, "/app"), label: app.nav.ledger, exact: true, count: review, countLabel: t(app.nav.review, { n: review }) },
        { href: href(locale, "/app/report"), label: app.nav.report },
      ]}
      pathname={pathname}
      LinkComponent={Link}
      label={app.nav.label}
      actions={
        demo ? (
          <DemoControls
            networkName={NETWORK_NAME}
            slow={demo.settings.slow}
            onSlowChange={(v) => setSettings({ slow: v })}
            failNext={demo.settings.failNext}
            onFailNextChange={(v) => setSettings({ failNext: v })}
            onReset={() => {
              resetDemo()
              toast.success(c.resetDone)
            }}
            title={c.title}
            openLabel={c.open}
            slowLabel={c.slow}
            slowHint={c.slowHint}
            failNextLabel={c.failNext}
            failNextHint={c.failNextHint}
            resetLabel={c.reset}
            resetHint={c.resetHint}
            resetConfirmTitle={c.resetConfirm}
            resetConfirmBody={c.resetConfirmBody}
            resetConfirmLabel={c.resetDo}
            cancelLabel={c.cancel}
            closeLabel={app.close}
          />
        ) : null
      }
    />
  )
}
