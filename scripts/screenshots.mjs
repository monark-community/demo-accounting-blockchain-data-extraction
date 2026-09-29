// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3139   (in another terminal)
//        pnpm screenshots                  (BASE_URL defaults to http://localhost:3139)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3139"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY // optional filter on the variant tag

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
// French: home page and key flows, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const STORE = "trustrate-demo-v1"
const L = {
  en: { connect: "Connect demo wallet", confirm: "Confirm", reject: "Reject", seal: "Seal review", menu: "Open menu" },
  fr: { connect: "Connecter le portefeuille de démo", confirm: "Confirmer", reject: "Refuser", seal: "Sceller l'avis", menu: "Ouvrir le menu" },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
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
    // Scroll through once so lazy images load, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

/** The wallet prompt is the dialog with a Confirm button. */
const prompt = (page, v) => page.getByRole("dialog").filter({ has: page.getByRole("button", { name: L[v.locale].confirm, exact: true }) })

async function address(page, name) {
  return page.evaluate(
    ([key, n]) => JSON.parse(localStorage.getItem(key)).members.find((m) => m.name === n).address,
    [STORE, name]
  )
}

async function connect(page, v, capture) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await prompt(page, v).waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await prompt(page, v).getByRole("button", { name: L[v.locale].confirm }).click()
  await page
    .getByRole("heading", { level: 1, name: v.locale === "fr" ? "Explorer la communauté" : "Explore the community" })
    .waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    // Let the hero loop reach its sealed state.
    await page.waitForTimeout(name === "home" ? 4600 : 400)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].menu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function setFailNext(page) {
  await page.evaluate((key) => {
    const s = JSON.parse(localStorage.getItem(key))
    s.settings.failNext = true
    localStorage.setItem(key, JSON.stringify(s))
  }, STORE)
}

async function appFlows(page, v) {
  // Flow 1: connect (gate + prompt), then the rejected variant.
  await connect(page, v, true)
  await page.evaluate((key) => {
    const s = JSON.parse(localStorage.getItem(key))
    s.wallet.status = "disconnected"
    localStorage.setItem(key, JSON.stringify(s))
  }, STORE)
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("main").getByRole("button", { name: "Connect demo wallet" }).click()
  await prompt(page, v).getByRole("button", { name: "Reject" }).click()
  await page.getByText("You declined the sign-in request").waitFor()
  await shot(page, v, "flow1-connect-rejected")
  await page.getByRole("main").getByRole("button", { name: "Connect demo wallet" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByRole("heading", { level: 1, name: "Explore the community" }).waitFor({ timeout: 10000 })

  // Flow 2: look someone up.
  await shot(page, v, "flow2-explore", true)
  const search = page.getByLabel("Search by name or paste an address")
  await search.fill("0x12ab")
  await shot(page, v, "flow2-search-invalid")
  await search.fill("amara")
  await shot(page, v, "flow2-search-name")
  const amara = await address(page, "Amara Okafor")
  await page.goto(`${BASE}/${v.locale}/app/profile/${amara}`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Amara Okafor" }).waitFor()
  await shot(page, v, "flow2-profile", true)
  await page.getByText("How is this calculated?").click()
  await page.getByText("How is this calculated?").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-score-breakdown")
  await page.goto(`${BASE}/${v.locale}/app/profile/0x8e3f1c2a9b7d4e6f0a1b2c3d4e5f6a7b8c9d0e1f`, { waitUntil: "networkidle" })
  await page.getByText("No reviews yet.", { exact: true }).waitFor()
  await shot(page, v, "flow2-empty-profile", true)

  // Flow 3: write and seal a review of Amara.
  await page.goto(`${BASE}/${v.locale}/app/write?to=${amara}`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Write a review" }).waitFor()
  await page.getByRole("button", { name: "Seal review" }).click()
  await shot(page, v, "flow3-composer-errors", true)
  await page.getByRole("radio", { name: /5 out of 5 stars/ }).click()
  for (const tag of ["Smart contracts", "On time", "Documentation"]) await page.getByRole("button", { name: tag, exact: true }).click()
  const comment = page.locator("textarea")
  await comment.fill("Missed the first deadline and was hard to reach, the contract was late and buggy.")
  await page.getByText(/Your words sound negative/).evaluate((el) => el.scrollIntoView({ block: "center" }))
  await shot(page, v, "flow3-tone-mismatch")
  await comment.fill("Shipped the ticketing contract a day early, with tests and a clear handover. Clear, patient and reliable.")
  await shot(page, v, "flow3-composer-filled", true)
  await setFailNext(page)
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("radio", { name: /5 out of 5 stars/ }).click()
  for (const tag of ["Smart contracts", "On time", "Documentation"]) await page.getByRole("button", { name: tag, exact: true }).click()
  await page.locator("textarea").fill("Shipped the ticketing contract a day early, with tests and a clear handover. Clear, patient and reliable.")
  await page.getByRole("button", { name: "Seal review" }).click()
  await prompt(page, v).waitFor()
  await shot(page, v, "flow3-seal-prompt")
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByText("Sealing your review…").first().waitFor()
  await shot(page, v, "flow3-sealing-pending")
  await page.getByText("The network rejected the transaction").waitFor({ timeout: 10000 })
  await page.getByText("The network rejected the transaction").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-seal-failed")
  await page.getByRole("button", { name: "Try again" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.waitForURL(/sealed=/, { timeout: 15000 })
  await page.getByText("Review sealed").waitFor()
  await page.waitForTimeout(1900)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow3-sealed")

  // Flow 4: reply to a review of you, and vote helpful.
  const you = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).wallet.address, STORE)
  await page.goto(`${BASE}/${v.locale}/app/profile/${you}`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Sam Rivera" }).waitFor()
  await shot(page, v, "flow4-my-reputation", true)
  const cafe = page.locator("article", { hasText: "catering invoice was paid" })
  await cafe.getByRole("button", { name: "Reply" }).click()
  await cafe.locator("textarea").fill("You're right, and I'm sorry. Invoices now go out the day after each event, approved by two officers.")
  await cafe.getByRole("button", { name: "Post reply" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await cafe.getByText("Reply from the reviewed address").waitFor({ timeout: 10000 })
  const kenji = page.locator("article", { hasText: "Clear brief and fair milestone" })
  await kenji.getByRole("button", { name: /Mark this review as helpful/ }).click()
  await kenji.getByRole("button", { name: /Remove your helpful vote/ }).waitFor({ timeout: 5000 })
  await cafe.scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-replied")

  // Flow 5: flag the spam review on Amara, then moderate it.
  await page.goto(`${BASE}/${v.locale}/app/profile/${amara}`, { waitUntil: "networkidle" })
  const spam = page.locator("article", { hasText: "airdrop" })
  await spam.getByRole("button", { name: "Flag" }).click()
  await page.getByRole("dialog").waitFor()
  await page.getByLabel("Note for moderators (optional)").fill("Two-day-old wallet promoting an airdrop link.")
  await shot(page, v, "flow5-flag-dialog")
  await page.getByRole("button", { name: "Flag review" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByText("Flag recorded").waitFor({ timeout: 10000 })
  await shot(page, v, "flow5-flagged")
  await page.goto(`${BASE}/${v.locale}/app/moderation`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Moderation" }).waitFor()
  await shot(page, v, "flow5-queue", true)
  const kase = page.locator("article", { hasText: "airdrop" })
  await kase.getByRole("button", { name: "Vote to hide" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await kase.getByText("Waiting for the other moderators").waitFor({ timeout: 10000 })
  await kase.scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-voting")
  await kase.getByText(/Hidden by community moderation \(3 of 5/).waitFor({ timeout: 15000 })
  await page.waitForTimeout(500)
  await kase.scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-decided")
  await page.goto(`${BASE}/${v.locale}/app/profile/${amara}`, { waitUntil: "networkidle" })
  await page.getByText(/Hidden by community moderation: spam/).first().waitFor()
  await page.getByText(/Hidden by community moderation: spam/).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-hidden-on-profile")

  // Activity trail and demo controls.
  await page.goto(`${BASE}/${v.locale}/app/profile/${you}`, { waitUntil: "networkidle" })
  await page.getByRole("tab", { name: /Activity/ }).click()
  await shot(page, v, "app-02-activity", true)
  await page.getByRole("button", { name: "Demo controls" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "app-03-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(4600)
  await shot(page, v, "page-home", true)
  await connect(page, v, true)
  await shot(page, v, "flow2-explore", true)
  const amara = await address(page, "Amara Okafor")
  await page.goto(`${BASE}/fr/app/profile/${amara}`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Amara Okafor" }).waitFor()
  await shot(page, v, "flow2-profile", true)
  await page.goto(`${BASE}/fr/app/write?to=${amara}`, { waitUntil: "networkidle" })
  await page.getByRole("radio", { name: /5 étoiles sur 5/ }).click()
  await page.getByRole("button", { name: "Contrats intelligents", exact: true }).click()
  await page.locator("textarea").fill("Contrat de billetterie livré un jour en avance, avec des tests et une passation claire. Patiente et fiable.")
  await shot(page, v, "flow3-composer-filled", true)
  await page.getByRole("button", { name: "Sceller l'avis" }).click()
  await prompt(page, v).waitFor()
  await shot(page, v, "flow3-seal-prompt")
  await prompt(page, v).getByRole("button", { name: "Confirmer" }).click()
  await page.waitForURL(/sealed=/, { timeout: 15000 })
  await page.waitForTimeout(1900)
  await shot(page, v, "flow3-sealed")
  await page.goto(`${BASE}/fr/app/moderation`, { waitUntil: "networkidle" })
  await shot(page, v, "flow5-queue", true)
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
      await marketing(page, v)
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
