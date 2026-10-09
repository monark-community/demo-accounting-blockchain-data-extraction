"use client"

import Image from "next/image"
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { WalletPrompt } from "@/components/ui/wallet-prompt"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { estimateFee, NETWORK_NAME } from "@/lib/demo/network"
import { initDemo, useDemo, usePrompt } from "@/lib/demo/store"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  disclaimer: string
  demoBadge: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  const narrow = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  useEffect(() => {
    initDemo()
  }, [])

  return (
    <AppContext.Provider value={value}>
      {children}
      <DemoWalletPrompt />
      <Toaster
        // Desktop: top-right, over the app bar's demo controls, away from the
        // ledger and the report it reports on. Phones: bottom.
        position={narrow ? "bottom-center" : "top-right"}
        offset={{ top: 80, right: 24 }}
        mobileOffset={{ bottom: 16, left: 16, right: 16 }}
      />
    </AppContext.Provider>
  )
}

/** The simulated wallet's confirmation sheet. Closing it counts as a rejection. */
function DemoWalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale } = useAppCopy()
  const p = app.prompt
  const summary = prompt?.summary
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : 0), [prompt])
  const feeText = fee ? `${fee.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 5 })} tETH` : ""

  return (
    <WalletPrompt
      open={!!prompt}
      onConfirm={() => prompt?.resolve(true)}
      onReject={() => prompt?.resolve(false)}
      site={
        <>
          <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized />
          {p.site}
        </>
      }
      title={summary?.title ?? p.title}
      description={p.title}
      account={demo ? { name: demo.wallet.name, address: demo.wallet.address } : undefined}
      rows={(summary?.rows ?? []).map((row) => ({
        label: row.label,
        value: row.mono ? <span className="font-mono text-xs font-normal break-all">{row.value}</span> : row.value,
      }))}
      network={NETWORK_NAME}
      fee={summary?.noFee ? undefined : feeText}
      disclaimer={summary?.movesValue ? disclaimer : p.simulated}
      warning={!!summary?.movesValue}
      confirmLabel={p.confirm}
      rejectLabel={p.reject}
      networkLabel={p.network}
      feeLabel={p.fee}
      closeLabel={app.close}
    />
  )
}
