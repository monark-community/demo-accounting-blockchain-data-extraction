"use client"

import { getDemo, requestSignature, setWallet } from "./store"
import type { TxSummary } from "./types"

/**
 * Simulated wallet connection: a sign-in message in the wallet prompt (it
 * also approves the voting session used for helpful votes), a short
 * handshake, then connected. Rejecting leaves the wallet disconnected.
 */
export async function connectWallet(summary: TxSummary): Promise<boolean> {
  const demo = getDemo()
  if (!demo || demo.wallet.status !== "disconnected") return false
  setWallet({ status: "connecting", lastError: null })
  const ok = await requestSignature(summary)
  if (!ok) {
    setWallet({ status: "disconnected", lastError: "rejected" })
    return false
  }
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
  setWallet({ status: "connected", lastError: null })
  return true
}

export function disconnectWallet() {
  setWallet({ status: "disconnected", lastError: null })
}
