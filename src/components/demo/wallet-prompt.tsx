"use client"

import Image from "next/image"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAvatar, WalletAddress } from "@/components/ui/wallet"
import { estimateFee, NETWORK_NAME } from "@/lib/demo/network"
import { useDemo, usePrompt } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"

/** The simulated wallet's confirmation sheet. Closing it counts as a rejection. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale } = useAppCopy()
  const p = app.prompt
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : 0), [prompt])
  const feeText = fee ? `${fee.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 5 })} tETH` : ""

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && prompt?.resolve(false)}>
      <DialogContent showCloseButton closeLabel={app.close} className="max-w-[calc(100%-2rem)] gap-5 rounded-3xl sm:max-w-md">
        <DialogHeader className="gap-1 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized className="size-5" />
            {p.site}
          </div>
          <DialogTitle className="pt-2 text-xl font-extrabold">{prompt?.summary.title ?? p.title}</DialogTitle>
          <DialogDescription>{p.title}</DialogDescription>
        </DialogHeader>

        {demo ? (
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/50 p-3">
            <WalletAvatar address={demo.wallet.address} size={32} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold">{demo.wallet.name}</p>
              <WalletAddress address={demo.wallet.address} className="text-xs text-muted-foreground" />
            </div>
          </div>
        ) : null}

        <dl className="divide-y rounded-2xl border text-sm">
          {prompt?.summary.rows?.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={row.mono ? "text-right font-mono text-xs break-all" : "text-right font-semibold"}>{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">{p.network}</dt>
            <dd>
              <NetworkBadge name={NETWORK_NAME} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
            </dd>
          </div>
          {!prompt?.summary.noFee ? (
            <div className="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{p.fee}</dt>
              <dd className="font-mono text-xs">{feeText}</dd>
            </div>
          ) : null}
        </dl>

        {prompt?.summary.movesValue ? <Disclaimer text={disclaimer} /> : <p className="text-xs text-muted-foreground">{p.simulated}</p>}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onClick={() => prompt?.resolve(false)}>
            {p.reject}
          </Button>
          <Button size="lg" onClick={() => prompt?.resolve(true)} autoFocus>
            {p.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
