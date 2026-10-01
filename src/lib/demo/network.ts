/** The simulated network the demo "runs" on. */
export const NETWORK_NAME = "Sepolia testnet"

/** Reference point for seeded data: block height at a fixed moment (12 s blocks). */
const HEAD_AT = Date.parse("2026-09-28T18:00:00Z")
export const SEED_HEAD = 5_812_340

export function blockAt(iso: string): number {
  return SEED_HEAD - Math.round((HEAD_AT - Date.parse(iso)) / 12_000)
}

/** Estimated network fee shown in the wallet prompt (simulated, in tETH). */
export function estimateFee(): number {
  return 0.00018 + Math.random() * 0.00016
}

/** Wallet addresses: 0x followed by 40 hex characters. */
export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export function sameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
