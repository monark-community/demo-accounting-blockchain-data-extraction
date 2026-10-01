"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, nextBlock, requestSignature, setSettings } from "./store"
import type { TxState, TxSummary } from "./types"

/**
 * Simulated chain. A transaction is: wallet prompt (sign or reject) ->
 * pending with a hash for a realistic block time -> confirmed in a block, or
 * reverted. "Fail the next transaction" in the demo controls forces one revert.
 */

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3000, 6000] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

/** Wait for inclusion. Returns the block number, or null when the transaction reverted. */
export async function mine(ms = blockTime()): Promise<number | null> {
  await sleep(ms)
  const demo = getDemo()
  if (demo?.settings.failNext) {
    setSettings({ failNext: false })
    return null
  }
  return nextBlock()
}

export interface RunOptions {
  /** Skip the wallet prompt (session-signed votes). */
  skipPrompt?: boolean
  /** Override the simulated inclusion time. */
  ms?: number
}

/**
 * One transaction's lifecycle for a component. `apply` runs only on
 * confirmation and receives the transaction hash and block.
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(
    async (summary: TxSummary, apply: (hash: string, block: number) => void, options: RunOptions = {}) => {
      if (busy.current) return false
      busy.current = true
      try {
        if (!options.skipPrompt) {
          setState({ phase: "signing" })
          const ok = await requestSignature(summary)
          if (!ok) {
            setState({ phase: "failed", error: "rejected" })
            return false
          }
        }
        const hash = randomHash()
        setState({ phase: "pending", hash })
        const block = await mine(options.ms)
        if (block === null) {
          setState({ phase: "failed", hash, error: "reverted" })
          return false
        }
        apply(hash, block)
        setState({ phase: "confirmed", hash, block })
        return true
      } finally {
        busy.current = false
      }
    },
    []
  )

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset, busy: state.phase === "signing" || state.phase === "pending" }
}
