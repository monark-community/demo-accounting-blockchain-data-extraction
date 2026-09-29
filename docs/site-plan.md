# LedgerLift site plan

LedgerLift by Monark turns a wallet's on-chain history into books an accountant can read. This plan describes what ships on `develop`; it is updated whenever the build changes course.

- Project page (authoritative): https://www.monark.io/en/project/accounting-blockchain-data-extraction
- Monark-branded: **true**. Colour, type, logo, header and footer follow `monark-brand-guidelines.md` (§2–§11), including the "Restraint" rules at the end of §8.

## 1. Product brief

**Target users.** The people who keep the books for Web3 money:

- treasurers of DAOs and student blockchain associations (Monark's own community: chapters, clubs, hackathon teams) who must report to members, sponsors and grant givers;
- freelance contributors paid in tokens who need clean records for their accountant;
- small Web3 businesses and community projects preparing an audit or a year-end.

**Job to be done.** "Give me my wallet's activity for a period as categorized, priced entries I can hand to an accountant, and let me prove later that the report wasn't changed."

**Domain concepts.**

| Concept | Meaning in LedgerLift |
|-|-|
| Books (workspace) | The set of wallets you report on together, with your rules and labels. |
| Extraction | Reading a wallet's transactions from an indexer (The Graph subgraph or a public API), decoding them and pricing them. |
| Entry | One lifted transaction: date, counterparty, token amount, value at the time, network fee, category. |
| Category | Income (grants, dues, revenue, rewards), expenses (payouts, services, events), neutral (own-wallet transfer, token swap), network fees, or "needs review". |
| Classification source | Where a category came from: you, one of your rules, an automatic heuristic. Unknown entries wait in "needs review". |
| Rule | "Everything from this address is X", created from one entry and applied to all matching ones. |
| Own-wallet transfer | A transfer between two wallets in the same books. It is neither income nor expense, so it drops out of the totals. |
| Price at transaction time | Each token amount is valued at that day's price, in the reporting currency (USD, CAD or EUR). |
| Report | An income statement for a period plus exports (ledger CSV, journal entries CSV). |
| Seal | A report fingerprint written on-chain (a transaction) so an auditor can check nothing changed. Any later edit marks the seal out of date. |

**What the Lovable version got wrong or left out.**

- It was a generic portfolio and capital-gains dashboard (portfolio value, 24h change, unrealized P&L) with mainnet coins, not a data-extraction tool. The core promise, "input a wallet address and receive categorized income/expenses, gas fees and timestamps", was never shown happening.
- No extraction flow, no classification review, no rules, no labels: categories were hardcoded.
- Transfers between a user's own wallets were counted as income and expenses, the most common bookkeeping error with crypto.
- No accounting output: no journal entries, no audit trail, no way to prove a report is unchanged.
- Blue-purple gradients, glass cards, mainnet token names, no French, no disclaimers.

## 2. Value proposition

**For DAO treasurers and freelancers paid in crypto, LedgerLift turns any wallet address into categorized, priced books ready for an accountant, without the spreadsheet cleanup that exports from block explorers need.**

Supporting benefits (outcomes):

1. **You close a period in minutes, not evenings**: every transaction arrives sorted and valued at the moment it happened.
2. **Your totals are right**: moving funds between your own wallets never shows up as income or spending.
3. **Your accountant and auditors can trust the numbers**: you hand over standard files and a report sealed on-chain.

## 3. Hero

| | English | French |
|-|-|-|
| Headline (≤ 10 words) | Your wallet history, ready for your accountant | Votre historique on-chain, prêt pour votre comptable |
| Supporting line | Paste an address. Every transaction comes back sorted, priced and ready to export. | Collez une adresse. Chaque transaction revient classée, valorisée et prête à exporter. |
| Primary CTA | Try a sample wallet → `/{locale}/app?sample=campus` (starts the extraction of the sample treasury) | Essayer un portefeuille exemple |
| Secondary CTA | How it works → `/{locale}/how-it-works` | Comment ça marche |

**Hero visual: the lift.** Product UI built in code, not a photo: a card shows one raw on-chain transaction (hash, method `transfer(address,uint256)`, amount in base units) and, below it, the same transaction lifted into a readable ledger line (date, counterparty, category chip, amount, value, fee). Every few seconds the next transaction lifts in. It *is* the product's promise, so it replaces any illustration. The mesh butterfly sits large and cropped behind it at low opacity (the site's only mesh).

## 4. Page map

Header (standard §10): brand · Overview · How it works · Demo · (Demo chip) (EN|FR) (theme) [Launch demo / connect-wallet in the app].
Footer (standard §10, three bands): product line + Overview, How it works, Demo, Credits · Monark band · legal band with "Demo · simulated data" and credits link.

| Route | Purpose | Sections in order |
|-|-|-|
| `/{locale}` | Home: the promise and one click into the demo. | Hero (lift card) · "Books you can hand over" (3 cards with UI fragments) · "For whoever keeps the books" (3 photo cards) · FAQ (4) · Closing CTA |
| `/{locale}/how-it-works` | The mechanics, kept off the home page. | Intro line · Pipeline diagram (fetch, decode, price, classify, export & seal) · How an entry gets its category (priority table) · Your wallets count as one (mini diagram) · Prices at the time · Sealing a report · For developers (disclosure: subgraph query, CSV columns) · CTA |
| `/{locale}/app` | The product: start screen, extraction, ledger and review. | App bar (Ledger, Report, network + demo controls pill) · Start (address input + two samples) → Extraction progress → Ledger (books header with wallets, suggestion, summary strip, filters, entries, entry sheet) |
| `/{locale}/app/report` | Period statement, exports and seal. | Period + currency · Income statement · Export (ledger CSV, journal CSV, preview) · Seal (fingerprint, transaction, history) |
| `/{locale}/credits` | Photo credits (required by the asset rules). | Photos · Type · Brand |
| `/{locale}/pricing` | Internal strategy review only. Unlinked, noindex, not in the sitemap. | Plan · Cost notes · Partners · Why |
| 404 | Localized not-found with the vertical Monark logo. | |

`/` redirects to the preferred locale. No `/use-cases` or `/developers`: audiences fit in one home section and the developer note fits on "How it works".

## 5. Feature highlights

| Feature | User benefit | Where | Proven by |
|-|-|-|-|
| Extraction from any address | See a wallet's period in seconds, no CSV cleanup | Hero, home card 1, `/app` start | Flow 1 |
| Automatic categories with a review queue | Only the unknowns need you | Home card 1, ledger | Flow 2 |
| Rules and labels | Fix a counterparty once, every entry follows | Ledger entry sheet | Flow 2 |
| Own-wallet detection | Totals stay right across several wallets | Home card 2, ledger suggestion | Flow 3 |
| Accountant-ready exports | Hand over files your tools import | Home card 3, report | Flow 4 |
| On-chain seal | Auditors can check the report is unchanged | Home card 3, report | Flow 4 |

## 6. Key flows

All state lives in `src/lib/demo/` (typed store in `localStorage`, simulated indexer, prices and chain). "Demo controls" (the network pill in the app bar) can slow the network or fail the next operation, and reset the demo.

1. **Extract a wallet.**
   Start screen → paste an address (or pick a sample) → *Extract history* → progress: reading blocks (counter, progress bar), decoding, pricing, classifying; lines land in a live preview → ledger opens.
   - Invalid address: inline error, one line. Unknown valid address: a believable history is generated from the address, recent activity only (so an earlier period shows the empty state).
   - Failed: "The indexer timed out at block N" + *Retry*, which resumes from that block. Cancel returns to the start screen.
2. **Review what needs you.**
   Ledger → "Needs review (5)" filter → open an entry → the sheet shows the lifted entry and, behind "On-chain details", the raw transaction → pick a category, optionally name the address and tick "Apply to all N from this address" → the row updates in place, the count drops, a rule is created (listed under *Rules*, removable).
   - Empty: "Nothing needs review." when the queue is clear; "No entries in this period." + *Change period* when a filter is empty.
3. **Combine your wallets.**
   The ledger notices an unlabelled address that received several transfers: "3 transfers went to 0x7c1…e4. Is it one of your wallets?" → *Add to these books* → a short extraction of that wallet → matching transfers become "Own-wallet transfer", the income and expense totals settle to their new values. Or *Add wallet* and paste one. *Not mine* dismisses the suggestion.
   - Failed extraction for the added wallet: same retry as flow 1; the books keep the first wallet.
4. **Export and seal a report.**
   Report → choose period and currency → income statement → *Download ledger (CSV)* / *Download journal entries (CSV)* (real files generated in the browser, preview behind a disclosure) → *Seal this report* → connect the demo wallet if needed (sign-in prompt) → wallet prompt with report, entries, fingerprint, fee and the one disclaimer "Testnet demo · not tax or accounting advice · no real funds" → pending with hash → confirmed "Sealed in block N".
   - Blocked while entries need review: one line + *Review N entries*.
   - Rejected in the wallet: "You declined in your wallet. Nothing was sent." + *Try again*. Reverted: "The network rejected the transaction. No fee was charged in this demo." + *Try again*.
   - Stale: editing an entry of a sealed period marks that seal "Out of date: the ledger changed after sealing".

## 7. Content (EN / FR)

Tone: Monark voice (§8): plain, practical, community-first, no hype. Terms explained on first use through info icons in the app, not paragraphs. The typed dictionaries in `src/i18n/dictionaries/{en,fr}.ts` hold every visible string; the tables below are the section copy.

### Home

| Section | English | French |
|-|-|-|
| Hero | see §3 | see §3 |
| Features H2 | Books you can hand over | Des livres prêts à transmettre |
| Card 1 | **Every transaction sorted.** Income, expenses, swaps and fees, each valued on the day it happened. | **Chaque transaction classée.** Revenus, dépenses, échanges et frais, valorisés au jour près. |
| Card 2 | **No double counting.** Transfers between your own wallets stay out of income and expenses. | **Aucun double comptage.** Les virements entre vos portefeuilles restent hors des revenus et dépenses. |
| Card 3 | **Ready for your accountant.** Export a ledger or journal entries, and seal the report on-chain. | **Prêt pour votre comptable.** Exportez un grand livre ou des écritures, et scellez le rapport on-chain. |
| Audiences H2 | For whoever keeps the books | Pour celles et ceux qui tiennent les comptes |
| Card | **DAO and club treasurers.** Report to members and sponsors without a weekend of spreadsheets. | **Trésoriers de DAO et d'associations.** Rendez des comptes aux membres et commanditaires sans y passer la fin de semaine. |
| Card | **Freelancers paid in crypto.** Hand your accountant clean income records each quarter. | **Pigistes payés en crypto.** Remettez chaque trimestre des revenus propres à votre comptable. |
| Card | **Community projects.** Show grant givers exactly where the money went. | **Projets communautaires.** Montrez à vos bailleurs où est allé chaque dollar. |
| FAQ H2 | Questions | Questions |
| Q1 | Do I need to connect my wallet? — No. Reading a public address is enough; connecting is only for sealing a report. | Faut-il connecter mon portefeuille ? — Non. Une adresse publique suffit ; la connexion sert seulement à sceller un rapport. |
| Q2 | Where does the data come from? — Public indexers such as The Graph. In this demo, the history is simulated. | D'où viennent les données ? — D'indexeurs publics comme The Graph. Dans cette démo, l'historique est simulé. |
| Q3 | Is this tax advice? — No. LedgerLift prepares your records; your accountant decides how to report them. | Est-ce un conseil fiscal ? — Non. LedgerLift prépare vos données ; votre comptable décide comment les déclarer. |
| Q4 | Can I fix a wrong category? — Yes. Change one entry or all entries from the same address in one go. | Puis-je corriger une catégorie ? — Oui. Modifiez une écriture, ou toutes celles d'une même adresse d'un coup. |
| Closing | See your books in a minute · *Try a sample wallet* | Vos livres en une minute · *Essayer un portefeuille exemple* |

### How it works

| Section | English | French |
|-|-|-|
| H1 + line | How LedgerLift works · From a wallet address to a report you can sign off, in five steps. | Comment fonctionne LedgerLift · D'une adresse à un rapport que vous pouvez signer, en cinq étapes. |
| Steps | Fetch: read every transaction from an indexer. · Decode: turn contract calls into plain actions. · Price: value each token on its day. · Classify: your rules first, then known patterns. · Export & seal: files for your accountant, a fingerprint on-chain. | Récupérer : lire chaque transaction depuis un indexeur. · Décoder : traduire les appels de contrat en actions claires. · Valoriser : chaque jeton au cours du jour. · Classer : vos règles d'abord, puis les cas connus. · Exporter et sceller : des fichiers pour le comptable, une empreinte on-chain. |
| Categories H2 | How an entry gets its category · The first match wins. | Comment une écriture reçoit sa catégorie · La première règle qui s'applique l'emporte. |
| Priority rows | 1 You changed it · 2 One of your rules · 3 Between your wallets → own-wallet transfer · 4 Known contract (swap router, approval) · 5 Known address in the directory · otherwise Needs review | 1 Vous l'avez modifiée · 2 Une de vos règles · 3 Entre vos portefeuilles → transfert interne · 4 Contrat connu (routeur d'échange, approbation) · 5 Adresse connue de l'annuaire · sinon À vérifier |
| Own wallets | Your wallets count as one · Money moving between them is neither earned nor spent. | Vos portefeuilles ne font qu'un · L'argent qui circule entre eux n'est ni gagné ni dépensé. |
| Prices | Prices at the time of the transaction · Example: 0.5 tETH on Aug 14 at $3,142.18 = $1,571.09. Network fees are valued the same way. | Le cours au moment de la transaction · Exemple : 0,5 tETH le 14 août à 3 142,18 $ = 1 571,09 $. Les frais de réseau suivent la même règle. |
| Seal | Sealing a report · The report's fingerprint is written on-chain. Change any entry later and the seal shows it. | Sceller un rapport · L'empreinte du rapport est inscrite on-chain. Si une écriture change ensuite, le sceau le signale. |
| Developers | For developers · The same pipeline runs on a subgraph query. *Show the query and export columns* | Pour les développeurs · Le même pipeline repose sur une requête de subgraph. *Afficher la requête et les colonnes d'export* |
| CTA | Try it on a sample wallet · *Open the demo* | Essayez sur un portefeuille exemple · *Ouvrir la démo* |

### App

| Element | English | French |
|-|-|-|
| Start H1 | Whose books are we lifting? | De quel portefeuille tient-on les comptes ? |
| Address field | Wallet address (placeholder `0x…`) · *Extract history* | Adresse du portefeuille · *Extraire l'historique* |
| Samples | Or try a sample · Campus Builders DAO, treasury of a student association · Léa Tremblay, freelance developer | Ou essayez un exemple · Campus Builders DAO, trésorerie d'une association étudiante · Léa Tremblay, développeuse à la pige |
| Invalid | Not a wallet address (0x + 40 characters). | Ce n'est pas une adresse (0x + 40 caractères). |
| Stages | Reading blocks · Decoding transactions · Pricing at transaction time · Classifying | Lecture des blocs · Décodage des transactions · Valorisation au cours du jour · Classement |
| Extraction failed | The indexer timed out at block {block}. · *Retry from there* | L'indexeur a expiré au bloc {block}. · *Reprendre à partir de là* |
| Summary | Income · Expenses · Network fees · Net | Revenus · Dépenses · Frais de réseau · Solde |
| Filters | All · Needs review · Income · Expenses | Tout · À vérifier · Revenus · Dépenses |
| Suggestion | {n} transfers went to {address}. Is it one of your wallets? · *Add to these books* · *Not mine* | {n} virements sont allés vers {address}. Est-ce un de vos portefeuilles ? · *L'ajouter à ces livres* · *Non* |
| Combined | {n} transfers between your wallets no longer count as income or expenses. | {n} virements entre vos portefeuilles ne comptent plus comme revenus ou dépenses. |
| Entry sheet | Category · Name this address · Apply to all {n} entries from this address · On-chain details · *Save* | Catégorie · Nommer cette adresse · Appliquer aux {n} écritures de cette adresse · Détails on-chain · *Enregistrer* |
| Empty | Nothing needs review. · No entries in this period. *Change period* · No matches for "{q}". | Rien à vérifier. · Aucune écriture sur cette période. *Changer de période* · Aucun résultat pour « {q} ». |
| Report | {period} report · Income statement · Not counted: {n} entries need review. *Review them* | Rapport {period} · État des résultats · Non comptées : {n} écritures à vérifier. *Les vérifier* |
| Export | Download ledger (CSV) · Download journal entries (CSV) · Preview journal entries | Télécharger le grand livre (CSV) · Télécharger les écritures (CSV) · Aperçu des écritures |
| Seal | Seal this report · Sealed in block {block} · Out of date: the ledger changed after sealing. | Sceller ce rapport · Scellé au bloc {block} · Périmé : le grand livre a changé depuis. |
| Wallet prompt | Testnet demo · not tax or accounting advice · no real funds | Démo sur testnet · pas un conseil fiscal ni comptable · aucun fonds réel |
| Tx errors | You declined in your wallet. Nothing was sent. · The network rejected the transaction. No fee was charged in this demo. | Vous avez refusé dans votre portefeuille. Rien n'a été envoyé. · Le réseau a rejeté la transaction. Aucuns frais dans cette démo. |

Error page, 404 and credits copy are in the dictionaries.

## 8. Aesthetics (Monark-branded: only what the guidelines leave open)

- **Layouts and rhythm.** Marketing pages are short and airy: max width 72rem, generous vertical spacing (py-16 to py-24), one idea per section. The home page alternates a text-led section with a visual-led one. The app is dense but calm: a single app bar, a books header, a four-number summary strip, then the ledger. Tabular numbers everywhere money appears, right-aligned amounts, monospace only for hashes and addresses.
- **Hero visual.** The lift card (section 3), built in code.
- **Illustrations.** The mesh butterfly, once, cropped behind the hero card at low opacity. New line-art diagrams drawn in JSX with flat orange 1.5–2px strokes: the five-step pipeline, and the "two wallets count as one" diagram on "How it works". No reused decorative SVGs beyond the mesh.
- **Photography.** Three warm, natural-light photos of people doing real work together (a student association meeting, a freelancer at their desk, a community project), on the audiences section only. No coins, charts or hooded hackers.
- **Mesh butterfly.** Yes, home hero only, cropped at the right edge behind the lift card, around 10–14% opacity in light and dark. No gradients anywhere (the logo's own gradient is the only one).
- **Signature moments.**
  1. **The lift**: during extraction and in the hero, a raw transaction (hash, method, base units) becomes a readable ledger line; lines land one after another in the live preview while the block counter runs.
  2. **The totals settle**: adding the second wallet turns matching transfers into "Own-wallet transfer" chips and the income and expense figures count down to their corrected values.
  3. **The seal**: the report's fingerprint gets stamped with a block number; editing an entry later visibly flips the seal to "out of date".

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `public/images/treasurers.jpg` (Unsplash) | Student association / DAO treasurers at work | Home, audiences card 1 |
| `public/images/freelancer.jpg` (Unsplash) | A freelancer at their desk | Home, audiences card 2 |
| `public/images/community.jpg` (Unsplash) | A community project in action | Home, audiences card 3 |
| `public/brand/monark-mark.svg` | Header brand, wallet prompt, favicon | Header, prompt, `src/app/icon.svg` |
| `public/brand/monark-horizontal-{light,dark}.svg` | Footer Monark band | Footer |
| `public/brand/monark-vertical-{light,dark}.svg` | 404 | 404 |
| `public/brand/monark-mesh.svg` | Hero decoration | Home hero |
| `public/brand/socials/*.svg` | Footer social icons | Footer |
| Open Graph image | Generated with `next/og`: brand, headline and a lifted ledger line | `/[locale]/opengraph-image` |

Icons: `lucide-react`. Diagrams: JSX/SVG line art (pipeline, own wallets). Photo sources and credits: `docs/assets.md` and `/credits`.

## 10. Pricing strategy

LedgerLift is Monark community tooling: **free, included in the Monark bundle**, for members, chapters, student associations and partners. The data it reads is public and the main running cost is indexer queries, which stay small at community scale. If partners later need heavy multi-wallet indexing or scheduled exports for many entities, a hosted tier for organizations can be discussed case by case; it is not shown anywhere on the site.

`/pricing` exists for internal review only: "Free, part of Monark", what's included, cost notes and the partner note. Never linked, `robots: noindex, nofollow`, excluded from the sitemap. No price is mentioned anywhere else.

## 11. Out of scope

- Real indexer or subgraph calls, real price feeds, real wallets or signing: everything is simulated in `src/lib/demo/`.
- Capital gains, cost basis and tax-lot calculations (the project page lists them as bonus features); tax filing of any kind.
- Direct pushes to QuickBooks or Xero (the demo produces import-ready CSV files).
- Accounts, teams, permissions and more than one set of books at a time.
- NFTs and bridges beyond plain transfers.

## 12. Implementation notes

- Next.js App Router, TypeScript strict, Tailwind v4, shadcn/ui on the `@monark/ui` registry, `next-themes`, `sonner`, `lucide-react`. No chart library: the statement bars are plain elements.
- Standard shell from Splitflow (`brand.tsx`, `header.tsx`, `demo-chip.tsx`…), Demo chip tint `bg-primary/8 dark:bg-primary/15`.
- Locale routes via `src/proxy.ts`; typed dictionaries; `Intl` for numbers, currency and dates.
- Demo data layer: `types.ts`, `prices.ts` (daily price series), `seed.ts` (samples and generated histories), `classify.ts` (priority rules), `extract.ts` (simulated indexer with progress and failure), `report.ts` (statement, CSV, journal, fingerprint), `store.ts` (persisted store), `chain.ts` / `wallet.ts` (simulated signing).
