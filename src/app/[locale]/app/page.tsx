import type { Metadata } from "next"

import { LedgerView } from "@/components/demo/ledger-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.app
  return pageMetadata(locale, "/app", m.title, m.description)
}

export default function AppPage() {
  return <LedgerView />
}
