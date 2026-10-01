"use client"

import { classify } from "./classify"
import { randomId } from "./ids"
import { sameAddress } from "./network"
import { update } from "./store"
import type { Books, BooksWallet, CategoryId, RawTx, SampleId, Seal } from "./types"

/** Actions on the books. Pure local state: classification never needs a transaction. */

function patchBooks(fn: (b: Books) => Books) {
  update((s) => (s.books ? { ...s, books: fn(s.books) } : s))
}

export function openBooks(name: string, sample: SampleId | null, wallet: BooksWallet, txs: RawTx[]) {
  update((s) => ({
    ...s,
    books: { name, sample, wallets: [wallet], entries: txs, rules: [], labels: {}, dismissed: [], seals: [], combined: null },
  }))
}

/**
 * Add a wallet and its history. A transfer already in the books (same hash,
 * read from the other side) is kept once. Returns how many entries became
 * own-wallet transfers.
 */
export function addWallet(wallet: BooksWallet, txs: RawTx[]) {
  patchBooks((b) => {
    const before = new Map(b.entries.map((e) => [e.hash, classify(e, b).category]))
    const known = new Set(b.entries.map((e) => e.hash))
    const next: Books = {
      ...b,
      wallets: [...b.wallets, wallet],
      entries: [...b.entries, ...txs.filter((t) => !known.has(t.hash))],
      dismissed: b.dismissed.filter((d) => !sameAddress(d, wallet.address)),
    }
    const count = next.entries.filter((e) => before.has(e.hash) && before.get(e.hash) !== "internal" && classify(e, next).category === "internal").length
    return { ...next, combined: { count, address: wallet.address, at: Date.now() } }
  })
}

export function removeWallet(address: string) {
  patchBooks((b) => {
    if (b.wallets.length < 2) return b
    return {
      ...b,
      wallets: b.wallets.filter((w) => !sameAddress(w.address, address)),
      entries: b.entries.filter((e) => !sameAddress(e.wallet, address)),
      combined: null,
    }
  })
}

export function clearCombined() {
  patchBooks((b) => ({ ...b, combined: null }))
}

/** Change one entry, or (withRule) every entry from the same address. */
export function categorize(hash: string, category: CategoryId, opts: { rule: boolean; label?: string }) {
  patchBooks((b) => {
    const entry = b.entries.find((e) => e.hash === hash)
    if (!entry) return b
    let next = b
    if (opts.rule) {
      next = {
        ...next,
        rules: [
          ...next.rules.filter((r) => !sameAddress(r.address, entry.counterparty)),
          { id: randomId("rule"), address: entry.counterparty, category, createdAt: new Date().toISOString() },
        ],
        // The rule now decides for every entry from this address.
        entries: next.entries.map((e) => (sameAddress(e.counterparty, entry.counterparty) ? { ...e, manual: undefined } : e)),
      }
    } else {
      next = { ...next, entries: next.entries.map((e) => (e.hash === hash ? { ...e, manual: category } : e)) }
    }
    const label = opts.label?.trim()
    const labels = { ...next.labels }
    for (const k of Object.keys(labels)) if (sameAddress(k, entry.counterparty)) delete labels[k]
    if (label) labels[entry.counterparty] = label
    return { ...next, labels }
  })
}

export function removeRule(id: string) {
  patchBooks((b) => ({ ...b, rules: b.rules.filter((r) => r.id !== id) }))
}

export function dismissSuggestion(address: string) {
  patchBooks((b) => ({ ...b, dismissed: [...b.dismissed, address] }))
}

export function addSeal(seal: Omit<Seal, "id">) {
  patchBooks((b) => ({ ...b, seals: [{ ...seal, id: randomId("seal") }, ...b.seals] }))
}

export function closeBooks() {
  update((s) => ({ ...s, books: null }))
}
