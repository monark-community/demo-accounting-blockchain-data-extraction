# LedgerLift by Monark

LedgerLift turns a wallet's on-chain history into books an accountant can read. Paste an address: every transaction comes back sorted into income, expenses, swaps and network fees, valued at the price of the day it happened. You review only what LedgerLift couldn't place, combine several wallets so transfers between them don't count twice, export a ledger or double-entry journal as CSV, and seal the report on-chain so auditors can check it later.

It is Monark community tooling for DAO and student-association treasurers, freelancers paid in tokens and community projects. Project page: https://www.monark.io/en/project/accounting-blockchain-data-extraction

> This is a **demo**. The indexer, prices, wallet and chain are simulated in the browser. Nothing touches a real network, and nothing here is tax or accounting advice.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Checks and production build:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (default `https://ledgerlift.monark.io`).

Screenshots (Playwright, against a running production server on port 3155):

```bash
pnpm build && pnpm start -p 3155
pnpm screenshots    # writes docs/screenshots/
```

## How the demo simulation works

Everything lives behind a small typed data layer in `src/lib/demo/`, so it can be swapped for a real indexer and wagmi/viem without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Raw transactions, entries, books, rules, seals, demo state. |
| `seed.ts` | Two sample wallets (Campus Builders DAO treasury and its operations wallet; Léa Tremblay, freelancer), a label directory, and a generator that gives any valid address a believable recent history. Testnet tokens only (tETH, tUSDC, tDAI, tLINK). |
| `prices.ts` | Deterministic daily prices, fixed USD/CAD/EUR rates, reporting periods. |
| `extract.ts` | The simulated indexer: reads blocks, decodes, prices and classifies with realistic latency. It can time out part-way; a retry resumes from the failed block. |
| `classify.ts` | Category resolution, first match wins: your choice, your rules, your own wallets, known contracts, known addresses, otherwise "needs review". Also the "is this one of your wallets?" suggestion. |
| `report.ts` | Income statement, ledger CSV, journal entries, report fingerprint, downloads. |
| `ops.ts` | Actions on the books (open, add or remove a wallet, categorize, rules, seals). |
| `store.ts` | A tiny external store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt channel. |
| `chain.ts`, `wallet.ts` | Simulated signing: wallet prompt, pending with a hash, confirmed in a block, or reverted. |

"Demo controls" (the network pill in the app bar) can slow the network, force the next extraction or seal to fail, and reset the demo.

## Project structure

```
src/
  app/[locale]/          routes: home, how-it-works, app (ledger), app/report, credits, pricing (unlinked), 404
  app/                   globals.css (Monark tokens), sitemap, robots, icon
  components/site/       standard Monark header, footer, brand, locale switch, theme
  components/demo/       the app: start, extraction, ledger, entry sheet, report, wallet prompt, demo controls
  components/home/       the hero "lift" card
  components/ui/         @monark/ui registry components (shadcn)
  i18n/                  typed EN/FR dictionaries and locale helpers
  lib/demo/              simulated data layer (see above)
  proxy.ts               redirects / to the preferred locale
docs/                    site plan, asset credits, screenshots
```

## Deploy to Vercel

Import the repository in Vercel with the framework defaults (Next.js, `pnpm install`, `pnpm build`). No `vercel.json` and no environment variables are required; every page prerenders. Node is pinned to 22.x in `package.json`.

## Credits

Built by [Monark](https://www.monark.io). Photos from Unsplash under the Unsplash License: see `docs/assets.md` and the site's `/credits` page.
