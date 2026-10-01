"use client"

import { InfoIcon } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Context on demand: an info icon that opens a small popover on click or tap
 * (brand guidelines §8, "Restraint"). Use it instead of a hint paragraph.
 */
export function InfoTip({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            className
          )}
        >
          <InfoIcon className="size-4" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          collisionPadding={16}
          className="z-50 max-w-72 rounded-2xl border bg-popover p-3.5 text-sm font-normal text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
