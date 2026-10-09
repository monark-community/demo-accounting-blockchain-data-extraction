"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/**
 * Sonner's toaster in Monark colours: toasts sit on the popover surface with
 * the border token and the theme radius, status icons are lucide icons in the
 * semantic tokens, and the theme follows next-themes. Mount it once, at the
 * app root.
 */
const Toaster = ({ style, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Sonner sets its own system font stack on the toaster.
          fontFamily: "var(--font-sans)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: "cn-toast",
          // Sonner's stylesheet is unlayered and hard-codes a grey here.
          description: "text-muted-foreground!",
          ...toastOptions?.classNames,
        },
      }}
    />
  )
}

export { Toaster }
