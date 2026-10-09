"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

// Sizes (track h x w, thumb):
//   sm      18.4 x 32px, 16px thumb
//   default 24 x 44px,   20px thumb (2px inset)
//   lg      28 x 52px,   24px thumb (2px inset)
// Every size gets an invisible ::after hit area at least 44px tall.
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-[18.4px] data-[size=sm]:w-[32px] data-[size=sm]:after:-inset-y-3.5 data-[size=default]:h-6 data-[size=default]:w-11 data-[size=default]:after:-inset-y-2.5 data-[size=lg]:h-7 data-[size=lg]:w-13 data-[size=lg]:after:-inset-y-2 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary-ink data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=sm]/switch:size-4 group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-unchecked:translate-x-0 group-data-[size=default]/switch:size-5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%+1px)] group-data-[size=default]/switch:data-unchecked:translate-x-px group-data-[size=lg]/switch:size-6 group-data-[size=lg]/switch:data-checked:translate-x-[calc(100%+1px)] group-data-[size=lg]/switch:data-unchecked:translate-x-px dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
