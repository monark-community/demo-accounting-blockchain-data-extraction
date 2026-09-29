import { seededAddress, seededHash, seededHex } from "./ids"
import { blockAt, SEED_HEAD } from "./network"
import { priceOn } from "./prices"
import type { BooksWallet, CategoryId, DemoState, Method, RawTx, SampleId, TokenSymbol } from "./types"

/**
 * Seeded, believable on-chain histories. Two samples (a student association's
 * treasury and a freelance developer) plus a generator that gives any valid
 * address a recent history, so every address "works".
 */

const A = {
  campus: seededAddress("campus-treasury"),
  ops: seededAddress("campus-ops"),
  lea: seededAddress("lea-tremblay"),
  kenji: seededAddress("kenji-watanabe"),
  amara: seededAddress("amara-okafor"),
  noah: seededAddress("noah-gagnon"),
  priya: seededAddress("priya-nair"),
  northbridge: seededAddress("northbridge-foundation"),
  lumen: seededAddress("lumen-labs"),
  nodehaus: seededAddress("nodehaus-rpc"),
  draftboard: seededAddress("draftboard"),
  hostwell: seededAddress("hostwell"),
  cafe: seededAddress("cafe-coop"),
  atelier: seededAddress("atelier-nord"),
  kestrel: seededAddress("kestrel-studio"),
  router: seededAddress("swap-router"),
  staking: seededAddress("staking-pool"),
  camille: seededAddress("camille-roy"),
  // Unlabelled counterparties: these land in "Needs review".
  newMember: seededAddress("unknown-new-member"),
  linkSender: seededAddress("unknown-link-sender"),
  caterer: seededAddress("unknown-caterer"),
  newClient: seededAddress("unknown-new-client"),
  friend: seededAddress("unknown-friend"),
} as const

const MEMBERS = [
  "Chloé Martin",
  "Diego Alvarez",
  "Yuki Sato",
  "Olivier Pelletier",
  "Fatou Diallo",
  "Marc-André Roy",
  "Hannah Weber",
  "Sami Haddad",
].map((name) => ({ name, address: seededAddress(`member-${name}`) }))

export interface DirectoryEntry {
  name: string
  /** Default category when money comes from this address. */
  in?: CategoryId
  /** Default category when money goes to this address. */
  out?: CategoryId
  contract?: boolean
}

/** Known addresses (a public label directory, simulated). Keys are lowercase. */
export const DIRECTORY: Record<string, DirectoryEntry> = Object.fromEntries(
  ([
    [A.campus, { name: "Campus Builders DAO", in: "revenue" }],
    [A.lea, { name: "Léa Tremblay", out: "payroll" }],
    [A.kenji, { name: "Kenji Watanabe", out: "payroll" }],
    [A.amara, { name: "Amara Okafor", out: "payroll" }],
    [A.noah, { name: "Noah Gagnon", out: "payroll" }],
    [A.priya, { name: "Priya Nair", out: "payroll" }],
    [A.northbridge, { name: "Northbridge Foundation", in: "grants" }],
    [A.lumen, { name: "Lumen Labs", in: "revenue" }],
    [A.nodehaus, { name: "Nodehaus RPC", out: "services" }],
    [A.draftboard, { name: "Draftboard", out: "services" }],
    [A.hostwell, { name: "Hostwell", out: "services" }],
    [A.cafe, { name: "Café Coop Saint-Henri", out: "events" }],
    [A.atelier, { name: "Atelier Nord", in: "revenue" }],
    [A.kestrel, { name: "Kestrel Studio", in: "revenue" }],
    [A.router, { name: "Swap router", contract: true }],
    [A.staking, { name: "Staking pool", in: "rewards", contract: true }],
    ...MEMBERS.map((m): [string, DirectoryEntry] => [m.address, { name: m.name, in: "dues" }]),
  ] as [string, DirectoryEntry][]).map(([addr, e]) => [addr.toLowerCase(), e])
)

export const SAMPLES: Record<SampleId, { books: string; wallet: BooksWallet }> = {
  campus: { books: "Campus Builders DAO", wallet: { address: A.campus, name: "Treasury" } },
  lea: { books: "Léa Tremblay", wallet: { address: A.lea, name: "Léa Tremblay" } },
}

/** The operations wallet the treasury sends to: the sample's "is this yours?" suggestion. */
export const CAMPUS_OPS: BooksWallet = { address: A.ops, name: "Operations" }

export const PERSONA = { address: A.camille, name: "Camille Roy" }

/* ------------------------------------------------------------------------- */

function rand(key: string): number {
  return parseInt(seededHex(key, 8), 16) / 0xffffffff
}

const GAS: Record<Method, [number, number]> = { transfer: [48_000, 65_000], swap: [142_000, 186_000], approve: [44_000, 47_000] }

function iso(month: number, day: number, key: string): string {
  const h = 8 + Math.floor(rand(`h:${key}`) * 12)
  const m = Math.floor(rand(`m:${key}`) * 60)
  const s = Math.floor(rand(`s:${key}`) * 60)
  const p = (n: number) => String(n).padStart(2, "0")
  return `2026-${p(month)}-${p(day)}T${p(h)}:${p(m)}:${p(s)}Z`
}

/**
 * One transaction seen from `wallet`. The hash depends only on `key`, so the
 * same transfer read from two wallets (sender and receiver) has one hash.
 */
function tx(
  key: string,
  when: string,
  wallet: string,
  direction: "in" | "out",
  counterparty: string,
  token: TokenSymbol,
  amount: number,
  method: Method = "transfer",
  received?: { token: TokenSymbol; amount: number }
): RawTx {
  const [gMin, gMax] = GAS[method]
  const gasUsed = Math.round(gMin + rand(`g:${key}`) * (gMax - gMin))
  const gasPriceGwei = Math.round((1.1 + rand(`gp:${key}`) * 2.6) * 100) / 100
  return {
    hash: seededHash(key),
    block: blockAt(when),
    timestamp: when,
    wallet,
    direction,
    counterparty,
    method,
    token,
    amount,
    received,
    // The sender pays the gas.
    feeEth: direction === "out" ? Math.round(gasUsed * gasPriceGwei * 1e-9 * 1e8) / 1e8 : 0,
    gasUsed,
    gasPriceGwei,
  }
}

function swapTx(key: string, when: string, wallet: string, token: TokenSymbol, amount: number, to: TokenSymbol): RawTx {
  const value = amount * priceOn(token, when)
  const out = (value / priceOn(to, when)) * 0.997
  const rounded = to === "tETH" ? Math.round(out * 10_000) / 10_000 : Math.round(out * 100) / 100
  return tx(key, when, wallet, "out", A.router, token, amount, "swap", { token: to, amount: rounded })
}

const MONTHS = [4, 5, 6, 7, 8, 9]

function campusHistory(): RawTx[] {
  const w = A.campus
  const out: RawTx[] = []
  for (const m of MONTHS) {
    out.push(tx(`pay-lea-${m}`, iso(m, 1, `pay-lea-${m}`), w, "out", A.lea, "tUSDC", 1800))
    out.push(tx(`pay-kenji-${m}`, iso(m, 1, `pay-kenji-${m}`), w, "out", A.kenji, "tUSDC", 1200))
    if (m >= 7) out.push(tx(`pay-amara-${m}`, iso(m, 15, `pay-amara-${m}`), w, "out", A.amara, "tUSDC", 900))
    out.push(tx(`nodehaus-${m}`, iso(m, 5, `nodehaus-${m}`), w, "out", A.nodehaus, "tUSDC", 49))
    const reward = Math.round((0.011 + rand(`stake-${m}`) * 0.007) * 10_000) / 10_000
    out.push(tx(`stake-${m}`, iso(m, 26, `stake-${m}`), w, "in", A.staking, "tETH", reward))
    for (let i = 0; i < 3; i++) {
      const member = MEMBERS[(m * 3 + i) % MEMBERS.length]!
      out.push(tx(`dues-${m}-${i}`, iso(m, 6 + i * 7, `dues-${m}-${i}`), w, "in", member.address, "tDAI", i % 2 ? 25 : 50))
    }
  }
  out.push(tx("grant-apr", iso(4, 10, "grant-apr"), w, "in", A.northbridge, "tUSDC", 12_000))
  out.push(tx("cafe-may", iso(5, 22, "cafe-may"), w, "out", A.cafe, "tDAI", 350))
  out.push(swapTx("swap-jun", iso(6, 12, "swap-jun"), w, "tETH", 1.5, "tUSDC"))
  out.push(tx("ops-jul", iso(7, 3, "ops-jul"), w, "out", A.ops, "tUSDC", 2000))
  out.push(tx("grant-jul", iso(7, 8, "grant-jul"), w, "in", A.northbridge, "tUSDC", 15_000))
  out.push(tx("member-jul", iso(7, 12, "member-jul"), w, "in", A.newMember, "tDAI", 50))
  out.push(tx("ops-aug", iso(8, 1, "ops-aug"), w, "out", A.ops, "tETH", 0.4))
  out.push(tx("lumen-aug", iso(8, 5, "lumen-aug"), w, "in", A.lumen, "tUSDC", 4000))
  out.push(tx("approve-aug", iso(8, 12, "approve-aug"), w, "out", A.router, "tETH", 0, "approve"))
  out.push(swapTx("swap-aug", iso(8, 12, "swap-aug"), w, "tETH", 1, "tUSDC"))
  out.push(tx("link-aug", iso(8, 20, "link-aug"), w, "in", A.linkSender, "tLINK", 120))
  out.push(tx("caterer-aug", iso(8, 22, "caterer-aug"), w, "out", A.caterer, "tDAI", 600))
  out.push(tx("ops-sep", iso(9, 2, "ops-sep"), w, "out", A.ops, "tUSDC", 1500))
  out.push(tx("member-sep", iso(9, 12, "member-sep"), w, "in", A.newMember, "tDAI", 50))
  out.push(tx("cafe-sep", iso(9, 18, "cafe-sep"), w, "out", A.cafe, "tDAI", 350))
  return out
}

function opsHistory(): RawTx[] {
  const w = A.ops
  return [
    // The receiving side of the treasury's transfers (same hashes).
    tx("ops-jul", iso(7, 3, "ops-jul"), w, "in", A.campus, "tUSDC", 2000),
    tx("ops-aug", iso(8, 1, "ops-aug"), w, "in", A.campus, "tETH", 0.4),
    tx("ops-sep", iso(9, 2, "ops-sep"), w, "in", A.campus, "tUSDC", 1500),
    tx("bounty-noah-jul", iso(7, 20, "bounty-noah-jul"), w, "out", A.noah, "tUSDC", 250),
    tx("bounty-priya-aug", iso(8, 18, "bounty-priya-aug"), w, "out", A.priya, "tUSDC", 300),
    tx("bounty-noah-sep", iso(9, 21, "bounty-noah-sep"), w, "out", A.noah, "tUSDC", 200),
  ]
}

function leaHistory(): RawTx[] {
  const w = A.lea
  const out: RawTx[] = []
  for (const m of MONTHS) {
    out.push(tx(`pay-lea-${m}`, iso(m, 1, `pay-lea-${m}`), w, "in", A.campus, "tUSDC", 1800))
    out.push(tx(`draftboard-${m}`, iso(m, 9, `draftboard-${m}`), w, "out", A.draftboard, "tUSDC", 15))
    out.push(tx(`hostwell-${m}`, iso(m, 20, `hostwell-${m}`), w, "out", A.hostwell, "tUSDC", 20))
  }
  out.push(tx("atelier-may", iso(5, 14, "atelier-may"), w, "in", A.atelier, "tUSDC", 2400))
  out.push(tx("kestrel-jun", iso(6, 19, "kestrel-jun"), w, "in", A.kestrel, "tDAI", 950))
  out.push(swapTx("lea-swap-jul", iso(7, 15, "lea-swap-jul"), w, "tUSDC", 2000, "tETH"))
  out.push(tx("atelier-aug", iso(8, 13, "atelier-aug"), w, "in", A.atelier, "tUSDC", 2400))
  out.push(tx("client-aug", iso(8, 28, "client-aug"), w, "in", A.newClient, "tDAI", 300))
  out.push(tx("friend-sep", iso(9, 3, "friend-sep"), w, "out", A.friend, "tETH", 0.05))
  out.push(tx("kestrel-sep", iso(9, 16, "kestrel-sep"), w, "in", A.kestrel, "tDAI", 950))
  out.push(tx("client-sep", iso(9, 25, "client-sep"), w, "in", A.newClient, "tDAI", 300))
  return out
}

/** A believable recent history (August and September only) for any other address. */
function generatedHistory(address: string): RawTx[] {
  const w = address
  const r = (k: string) => rand(`${address.toLowerCase()}:${k}`)
  const templates: ((k: string, when: string) => RawTx)[] = [
    (k, when) => tx(k, when, w, "in", [A.atelier, A.kestrel, A.lumen][Math.floor(r(k) * 3)]!, "tUSDC", Math.round(300 + r(`${k}a`) * 2400)),
    (k, when) => tx(k, when, w, "out", [A.nodehaus, A.draftboard, A.hostwell][Math.floor(r(k) * 3)]!, "tUSDC", [15, 20, 49][Math.floor(r(`${k}a`) * 3)]!),
    (k, when) => tx(k, when, w, "in", A.staking, "tETH", Math.round((0.004 + r(k) * 0.01) * 10_000) / 10_000),
    (k, when) => tx(k, when, w, "out", [A.noah, A.priya, A.amara][Math.floor(r(k) * 3)]!, "tUSDC", Math.round(150 + r(`${k}a`) * 500)),
    (k, when) => swapTx(k, when, w, "tETH", Math.round((0.1 + r(k) * 0.6) * 100) / 100, "tUSDC"),
  ]
  const n = 11 + Math.floor(r("n") * 6)
  const out: RawTx[] = []
  for (let i = 0; i < n; i++) {
    const k = `${address.toLowerCase()}-${i}`
    const month = r(`mo${i}`) < 0.5 ? 8 : 9
    const day = 1 + Math.floor(r(`d${i}`) * (month === 9 ? 26 : 30))
    out.push(templates[Math.floor(r(`t${i}`) * templates.length)]!(k, iso(month, day, k)))
  }
  // Two unknown counterparties, so there is something to review.
  const stranger = seededAddress(`${address}-stranger`)
  out.push(tx(`${address}-u1`, iso(8, 17, `${address}-u1`), w, "in", stranger, "tDAI", Math.round(40 + r("u1") * 400)))
  out.push(tx(`${address}-u2`, iso(9, 9, `${address}-u2`), w, "out", seededAddress(`${address}-payee`), "tETH", Math.round((0.02 + r("u2") * 0.2) * 1000) / 1000))
  return out
}

/** The full history the simulated indexer returns for an address. */
export function historyOf(address: string): RawTx[] {
  const a = address.toLowerCase()
  if (a === A.campus.toLowerCase()) return campusHistory()
  if (a === A.ops.toLowerCase()) return opsHistory()
  if (a === A.lea.toLowerCase()) return leaHistory()
  return generatedHistory(address)
}

/** First block the indexer scans for an address (roughly its first activity). */
export function firstBlockOf(address: string): number {
  const txs = historyOf(address)
  const min = Math.min(...txs.map((t) => t.block))
  return Number.isFinite(min) ? min - 1200 : SEED_HEAD - 400_000
}

export function createSeed(): DemoState {
  return {
    version: 1,
    books: null,
    wallet: { status: "disconnected", address: PERSONA.address, name: PERSONA.name, lastError: null },
    settings: { slow: false, failNext: false },
    prefs: { period: "q3", currency: "USD" },
    head: SEED_HEAD,
  }
}
