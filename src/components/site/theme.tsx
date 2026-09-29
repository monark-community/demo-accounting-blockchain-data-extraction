"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type * as React from "react"

import { Button } from "@/components/ui/button"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}

/** Toggles cream (light) / espresso (dark). Icons swap with CSS, so there is no hydration flash. */
export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden size-[18px] dark:block" aria-hidden="true" />
      <MoonIcon className="size-[18px] dark:hidden" aria-hidden="true" />
    </Button>
  )
}
