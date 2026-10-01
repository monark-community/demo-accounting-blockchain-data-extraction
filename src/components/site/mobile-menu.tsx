"use client"

import { MenuIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Locale } from "@/i18n/config"

import { DemoChip } from "./demo-chip"
import { HeaderAction, type WalletLabels } from "./header-action"
import { LocaleSwitch } from "./locale-switch"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

/** Below lg: brand + this menu button only; the sheet holds everything else. */
export function MobileMenu({
  locale,
  items,
  labels,
  appHref,
  wallet,
}: {
  locale: Locale
  items: NavItem[]
  appHref: string
  wallet: WalletLabels
  labels: {
    open: string
    close: string
    title: string
    description: string
    launch: string
    theme: string
    language: string
    names: Record<Locale, string>
    short: Record<Locale, string>
    demoChip: string
    demoBadge: string
  }
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="ml-auto lg:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="w-full max-w-sm gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-base font-extrabold">{labels.title}</SheetTitle>
          <SheetDescription className="sr-only">{labels.description}</SheetDescription>
        </SheetHeader>
        <nav aria-label={labels.title} className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks
            items={items}
            className="flex flex-col gap-1"
            itemClassName="h-12 w-full rounded-full px-4 text-base aria-[current=page]:bg-secondary"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <div className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <DemoChip label={labels.demoChip} title={labels.demoBadge} className="self-start" />
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitch locale={locale} label={labels.language} names={labels.names} short={labels.short} />
            <ThemeToggle label={labels.theme} />
          </div>
          <HeaderAction
            appHref={appHref}
            launchLabel={labels.launch}
            wallet={wallet}
            className="h-12 w-full justify-center"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
