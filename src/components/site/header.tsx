import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { Brand } from "./brand"
import { DemoChip } from "./demo-chip"
import { HeaderAction, type WalletLabels } from "./header-action"
import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

/** Standard Monark shell header (brand guidelines §10). */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const items = [
    { href: href(locale), label: c.nav.overview },
    { href: href(locale, "/how-it-works"), label: c.nav.how },
    { href: href(locale, "/app"), label: c.nav.demo },
  ]
  const appHref = href(locale, "/app")
  const wallet: WalletLabels = {
    connect: dict.app.wallet.connect,
    connecting: dict.app.wallet.connecting,
    disconnect: dict.app.wallet.disconnect,
    signIn: dict.app.summaries.signIn,
    signInRow: dict.app.summaries.signInRow,
    signInValue: dict.app.summaries.signInValue,
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Brand href={href(locale)} product={c.product} label={c.homeLabel} />
        <nav aria-label={c.nav.label} className="ml-7 hidden lg:block">
          <NavLinks items={items} className="flex items-center gap-5" />
        </nav>
        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <DemoChip label={c.demoChip} title={c.demoBadge} />
          <LocaleSwitch locale={locale} label={c.language.label} names={{ en: c.language.en, fr: c.language.fr }} short={c.language.short} />
          <ThemeToggle label={c.theme.toggle} />
          <HeaderAction appHref={appHref} launchLabel={c.launchDemo} wallet={wallet} />
        </div>
        <MobileMenu
          locale={locale}
          items={items}
          appHref={appHref}
          wallet={wallet}
          labels={{
            open: c.menu,
            close: c.closeMenu,
            title: c.menuTitle,
            description: c.nav.label,
            launch: c.launchDemo,
            theme: c.theme.toggle,
            language: c.language.label,
            names: { en: c.language.en, fr: c.language.fr },
            short: c.language.short,
            demoChip: c.demoChip,
            demoBadge: c.demoBadge,
          }}
        />
      </div>
    </header>
  )
}
