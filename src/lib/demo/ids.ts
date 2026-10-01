/** Deterministic hex from a seed string (FNV-1a + xorshift), for believable seeded data. */
export function seededHex(seed: string, length: number): string {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  let out = ""
  let x = h || 1
  while (out.length < length) {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    out += x.toString(16).padStart(8, "0")
  }
  return out.slice(0, length)
}

export const seededAddress = (seed: string) => `0x${seededHex(`addr:${seed}`, 40)}`
export const seededHash = (seed: string) => `0x${seededHex(`tx:${seed}`, 64)}`

/** Random hex for runtime-created objects. Math.random on purpose: works on plain-http LAN dev. */
export function randomHex(length: number): string {
  let out = ""
  while (out.length < length) out += Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0")
  return out.slice(0, length)
}

export const randomAddress = () => `0x${randomHex(40)}`
export const randomHash = () => `0x${randomHex(64)}`
export const randomId = (prefix = "id") => `${prefix}-${randomHex(10)}`

export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}
