import { notFound } from "next/navigation"

import { AppFrame } from "@/components/demo/app-frame"
import { AppProvider } from "@/components/demo/app-provider"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    <AppProvider value={{ locale, app: dict.app, disclaimer: dict.common.disclaimer, demoBadge: dict.common.demoBadge }}>
      <AppFrame>{children}</AppFrame>
    </AppProvider>
  )
}
