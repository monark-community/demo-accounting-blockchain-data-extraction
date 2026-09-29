// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3155   (in another terminal)
//        pnpm screenshots                  (BASE_URL defaults to http://localhost:3155)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3155"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY // optional filter on the variant tag

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
// French: home page and the first flows, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    confirm: "Confirm",
    reject: "Reject",
    menu: "Open menu",
    controls: /Demo controls/,
    failNext: "Fail the next operation",
    campus: /Campus Builders DAO/,
    review: /^Needs review/,
    open: /^Open entry/,
    save: "Save",
    ledger: "Campus Builders DAO",
  },
  fr: {
    confirm: "Confirmer",
    reject: "Refuser",
    menu: "Ouvrir le menu",
    controls: /Réglages de la démo/,
    failNext: "Faire échouer la prochaine opération",
    campus: /Campus Builders DAO/,
    review: /^À vérifier/,
    open: /^Ouvrir l’écriture|^Ouvrir l'écriture/,
    save: "Enregistrer",
    ledger: "Campus Builders DAO",
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
    acceptDownloads: true,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  if (fullPage) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })
  }
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const prompt = (page, v) => page.getByRole("dialog").filter({ has: page.getByRole("button", { name: L[v.locale].confirm, exact: true }) })

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].menu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function failNext(page, v) {
  await page.getByRole("button", { name: L[v.locale].controls }).click()
  await page.getByLabel(L[v.locale].failNext).click()
  await shot(page, v, "app-demo-controls")
  await page.keyboard.press("Escape")
}

/** Open the first entry in the current list, pick a category, optionally name it, save. */
async function categorizeFirst(page, v, category, label) {
  await page.getByRole("button", { name: L[v.locale].open }).first().click()
  const sheet = page.getByRole("dialog")
  await sheet.waitFor()
  await sheet.getByRole("radio", { name: category, exact: true }).check({ force: true })
  if (label) await sheet.getByLabel(v.locale === "fr" ? "Nommer cette adresse" : "Name this address").fill(label)
  return sheet
}

async function startCampus(page, v, { capture, fail }) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: L[v.locale].campus }).waitFor()
  if (capture) {
    await shot(page, v, "flow1-start", true)
    await page.getByLabel(v.locale === "fr" ? "Adresse du portefeuille" : "Wallet address").fill("0x12ab")
    await page.getByRole("button", { name: v.locale === "fr" ? "Extraire l'historique" : "Extract history" }).click()
    await shot(page, v, "flow1-invalid")
  }
  if (fail) await failNext(page, v)
  await page.getByRole("button", { name: L[v.locale].campus }).click()
  if (capture) {
    await page.waitForTimeout(1500)
    await shot(page, v, "flow1-extracting")
  }
  if (fail) {
    await page.getByRole("alert").filter({ hasText: /timed out|expiré/ }).waitFor({ timeout: 15000 })
    await shot(page, v, "flow1-failed")
    await page.getByRole("button", { name: v.locale === "fr" ? "Reprendre à partir de là" : "Retry from there" }).click()
  }
  await page.getByRole("heading", { level: 1, name: L[v.locale].ledger }).waitFor({ timeout: 20000 })
  await page.waitForTimeout(400)
}

async function appFlows(page, v) {
  // Report before any books: empty state.
  await page.goto(`${BASE}/en/app/report`, { waitUntil: "networkidle" })
  await page.getByText("No books yet.").waitFor()
  await shot(page, v, "app-report-empty")

  // Flow 1: start, invalid address, extraction (fails once, retry resumes), ledger.
  await startCampus(page, v, { capture: true, fail: true })
  await shot(page, v, "flow1-ledger", true)

  // Flow 2: review queue, entry sheet with rule, on-chain details.
  await page.getByRole("button", { name: L.en.review }).click()
  await shot(page, v, "flow2-review-queue", true)
  const sheet = await categorizeFirst(page, v, "Membership dues", "Inès Moreau (new member)")
  await shot(page, v, "flow2-sheet")
  await sheet.getByText("On-chain details").click()
  await sheet.getByText("On-chain details").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-onchain")
  await sheet.getByRole("button", { name: "Save" }).click()
  await page.waitForTimeout(500)
  await shot(page, v, "flow2-after-rule")

  // Flow 3: the own-wallet suggestion, then the totals settle.
  await page.getByRole("button", { name: "All", exact: true }).click()
  await page.getByText(/Is it one of your wallets\?/).waitFor()
  await shot(page, v, "flow3-suggestion")
  await page.getByRole("button", { name: "Add to these books" }).click()
  await page.waitForTimeout(1600)
  await shot(page, v, "flow3-extracting")
  await page.getByText(/no longer count as income or expenses/).waitFor({ timeout: 20000 })
  await page.waitForTimeout(900)
  await shot(page, v, "flow3-combined", true)

  // Report with entries still in review.
  await page.goto(`${BASE}/en/app/report`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow4-report-review", true)

  // Clear the rest of the queue.
  await page.goto(`${BASE}/en/app`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: L.en.review }).click()
  for (const cat of ["Events", "Other income"]) {
    const s = await categorizeFirst(page, v, cat)
    await s.getByRole("button", { name: "Save" }).click()
    await page.waitForTimeout(400)
  }
  await page.getByText("Nothing needs review.").waitFor()
  await shot(page, v, "flow2-empty-review")

  // Flow 4: report, journal preview, seal (reject once, then confirm), stale.
  await page.goto(`${BASE}/en/app/report`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Seal this report" }).waitFor()
  await page.getByText("Preview journal entries").click()
  await shot(page, v, "flow4-report", true)
  await page.getByRole("button", { name: "Seal this report" }).click()
  await prompt(page, v).waitFor()
  await shot(page, v, "flow4-connect-prompt")
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await prompt(page, v).filter({ hasText: "Fingerprint" }).waitFor({ timeout: 8000 })
  await shot(page, v, "flow4-seal-prompt")
  await prompt(page, v).getByRole("button", { name: "Reject" }).click()
  await page.getByText("You declined in your wallet").waitFor()
  await shot(page, v, "flow4-rejected")
  await page.getByRole("button", { name: "Try again" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.waitForTimeout(700)
  await shot(page, v, "flow4-pending")
  await page.getByText(/Sealed in block/).first().waitFor({ timeout: 15000 })
  await shot(page, v, "flow4-sealed")

  // Change an entry of the sealed period: the seal goes out of date.
  await page.goto(`${BASE}/en/app`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Income", exact: true }).click()
  const s2 = await categorizeFirst(page, v, "Other income")
  await s2.getByRole("button", { name: "Save" }).click()
  await page.goto(`${BASE}/en/app/report`, { waitUntil: "networkidle" })
  await page.getByText(/Out of date/).waitFor()
  await shot(page, v, "flow4-stale")

  // Empty period.
  await page.goto(`${BASE}/en/app`, { waitUntil: "networkidle" })
  await page.getByRole("combobox", { name: "Period" }).click()
  await page.getByRole("option", { name: "Q2 2026" }).click()
  await page.getByRole("button", { name: "Needs review" }).click().catch(() => {})
  await shot(page, v, "app-q2")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, v, "page-home", true)
  await page.goto(`${BASE}/fr/how-it-works`, { waitUntil: "networkidle" })
  await shot(page, v, "page-how-it-works", true)
  await startCampus(page, v, { capture: true, fail: false })
  await shot(page, v, "flow1-ledger", true)
  await page.getByRole("button", { name: L.fr.review }).click()
  await categorizeFirst(page, v, "Cotisations", "Inès Moreau (nouvelle membre)")
  await shot(page, v, "flow2-sheet")
  await page.goto(`${BASE}/fr/app/report`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow4-report", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      if (!process.env.APP_ONLY) await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
