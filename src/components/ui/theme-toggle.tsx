"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "cn"

/**
 * next-themes provider with the Monark defaults: the `.dark` class on
 * `<html>`, following the system preference until the visitor picks one.
 * Wrap your root layout's `<body>` content in it (and add
 * `suppressHydrationWarning` to `<html>`), or use your own provider.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export interface ThemeToggleProps
  extends Omit<React.ComponentProps<typeof Button>, "children" | "onClick"> {
  /** Accessible name (and tooltip). Default "Toggle theme". */
  label?: string
}

/**
 * 36px ghost icon button that flips between light and dark. The moon shows
 * in light mode and the sun in dark mode; the swap is pure CSS (`dark:`),
 * so the server-rendered icon is already right and nothing flashes on
 * hydration. Needs a next-themes provider with `attribute="class"`.
 */
function ThemeToggle({ label = "Toggle theme", className, ...props }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      data-slot="theme-toggle"
      className={cn("size-9 shrink-0 rounded-full [&_svg]:size-[18px]", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
    >
      <SunIcon className="hidden dark:block" aria-hidden="true" />
      <MoonIcon className="dark:hidden" aria-hidden="true" />
    </Button>
  )
}

export { ThemeToggle, ThemeProvider }
