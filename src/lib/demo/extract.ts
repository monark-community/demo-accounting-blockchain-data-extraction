"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { firstBlockOf, historyOf } from "./seed"
import { getDemo, setSettings } from "./store"
import type { RawTx } from "./types"

/**
 * Simulated indexer (think: a subgraph query paged by block range). Reads
 * blocks from the wallet's first activity to the head, decodes, prices and
 * classifies. "Fail the next operation" in the demo controls makes it time
 * out part-way; a retry resumes from the block where it stopped.
 */

export const STAGES = ["blocks", "decode", "price", "classify"] as const
export type Stage = (typeof STAGES)[number]

export interface ExtractState {
  phase: "idle" | "running" | "failed" | "done"
  address: string
  /** Index into STAGES of the stage in progress (4 when done). */
  stage: number
  fromBlock: number
  toBlock: number
  block: number
  found: number
  /** The latest transactions found, newest first (at most 4). */
  preview: RawTx[]
  failedAt: number | null
}

const IDLE: ExtractState = { phase: "idle", address: "", stage: 0, fromBlock: 0, toBlock: 0, block: 0, found: 0, preview: [], failedAt: null }

// Share of the total time per stage; reading blocks dominates.
const WEIGHTS = [0.62, 0.12, 0.14, 0.12]

export function useExtraction(onDone: (address: string, txs: RawTx[]) => void) {
  const [state, setState] = useState<ExtractState>(IDLE)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const run = useRef<{ address: string; txs: RawTx[]; from: number; progress: number; failAt: number | null } | null>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])

  useEffect(() => stop, [stop])

  const tick = useCallback(
    (total: number) => {
      const r = run.current
      if (!r) return
      r.progress = Math.min(1, r.progress + 80 / total)
      const { txs } = r
      const from = r.from
      const head = getDemo()?.head ?? from
      const blocksShare = Math.min(1, r.progress / WEIGHTS[0]!)
      const block = Math.round(from + (head - from) * blocksShare)

      if (r.failAt !== null && r.progress >= r.failAt) {
        stop()
        r.failAt = null
        setState((s) => ({ ...s, phase: "failed", block, failedAt: block }))
        return
      }

      let acc = 0
      let stage = 0
      for (let i = 0; i < WEIGHTS.length; i++) {
        acc += WEIGHTS[i]!
        if (r.progress < acc - 1e-9) {
          stage = i
          break
        }
        stage = i + 1
      }
      const seen = txs.filter((t) => t.block <= block).sort((a, b) => b.block - a.block)
      setState({
        phase: r.progress >= 1 ? "done" : "running",
        address: r.address,
        stage,
        fromBlock: from,
        toBlock: head,
        block,
        found: seen.length,
        preview: seen.slice(0, 4),
        failedAt: null,
      })
      if (r.progress >= 1) {
        stop()
        run.current = null
        // Let the last stage show as done for a beat, then hand over and go idle.
        setTimeout(() => {
          done.current(r.address, txs)
          setState(IDLE)
        }, 450)
      }
    },
    [stop]
  )

  const begin = useCallback(
    (resume: boolean) => {
      const r = run.current
      if (!r) return
      stop()
      const demo = getDemo()
      const total = demo?.settings.slow ? 9500 : 4400
      if (demo?.settings.failNext) {
        setSettings({ failNext: false })
        // Time out somewhere in the middle of reading blocks.
        r.failAt = Math.max(r.progress + 0.08, WEIGHTS[0]! * (0.55 + Math.random() * 0.2))
      }
      if (!resume) r.progress = 0
      setState((s) => ({ ...s, phase: "running", address: r.address, failedAt: null }))
      timer.current = setInterval(() => tick(total), 80)
    },
    [stop, tick]
  )

  const start = useCallback(
    (address: string) => {
      const from = firstBlockOf(address)
      run.current = { address, txs: historyOf(address), from, progress: 0, failAt: null }
      setState({ ...IDLE, phase: "running", address, fromBlock: from, toBlock: getDemo()?.head ?? from, block: from })
      begin(false)
    },
    [begin]
  )

  const retry = useCallback(() => begin(true), [begin])

  const cancel = useCallback(() => {
    stop()
    run.current = null
    setState(IDLE)
  }, [stop])

  return { state, start, retry, cancel }
}
