import type { Metadata } from "next"

import { ReportView } from "@/components/demo/report-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/report">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.report
  return pageMetadata(locale, "/app/report", m.title, m.description)
}

export default function ReportPage() {
  return <ReportView />
}
