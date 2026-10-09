"use client"

import * as React from "react"
import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/**
 * One labelled switch row inside DemoControls. Use it for the built-in toggles
 * and for any extra ones passed as children.
 */
function DemoControlsToggle({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  id?: string
  label: React.ReactNode
  hint?: React.ReactNode
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}) {
  const autoId = React.useId()
  const switchId = id ?? autoId
  const hintId = `${switchId}-hint`

  return (
    <div
      data-slot="demo-controls-toggle"
      className={cn("flex items-start justify-between gap-4 p-4", className)}
      {...props}
    >
      <div>
        <Label htmlFor={switchId} className="text-sm font-bold">
          {label}
        </Label>
        {hint ? (
          <p id={hintId} className="mt-1 text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
      />
    </div>
  )
}

/**
 * The demo's control panel: a trigger pill (network name, live dot, a warning
 * dot while a fault is armed) that opens a dialog with "slow network" and
 * "fail next transaction" switches, a slot for extra toggles, and a two-step
 * "Reset demo" (click, then confirm). All state is controlled by the app.
 */
function DemoControls({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  networkName,
  slow,
  onSlowChange,
  failNext,
  onFailNextChange,
  modified,
  onReset,
  children,
  title = "Demo controls",
  openLabel = "Demo controls",
  slowLabel = "Slow network",
  slowHint = "Transactions take 3 to 6 seconds.",
  failNextLabel = "Make the next transaction fail",
  failNextHint = "Your next transaction fails.",
  resetLabel = "Reset demo",
  resetHint = "Brings back the example data.",
  resetConfirmTitle = "Reset the demo?",
  resetConfirmBody = "Everything you did will be erased.",
  resetConfirmLabel = "Yes, reset",
  cancelLabel = "Cancel",
  closeLabel = "Close",
  className,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "title" | "children"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Replaces the default trigger button (rendered with DialogTrigger asChild). */
  trigger?: React.ReactNode
  /** Network name shown in the default trigger, next to a live dot. */
  networkName?: string
  slow: boolean
  onSlowChange?: (slow: boolean) => void
  failNext: boolean
  onFailNextChange?: (failNext: boolean) => void
  /** Shows the trigger's warning dot. Defaults to `slow || failNext`. */
  modified?: boolean
  /** Called once the reset is confirmed; the dialog then closes. Omit to hide the reset block. */
  onReset?: () => void
  /** Extra toggles, typically DemoControlsToggle rows. */
  children?: React.ReactNode
  title?: React.ReactNode
  /** Accessible name and tooltip of the default trigger. */
  openLabel?: string
  slowLabel?: React.ReactNode
  slowHint?: React.ReactNode
  failNextLabel?: React.ReactNode
  failNextHint?: React.ReactNode
  resetLabel?: React.ReactNode
  resetHint?: React.ReactNode
  resetConfirmTitle?: React.ReactNode
  resetConfirmBody?: React.ReactNode
  resetConfirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  closeLabel?: string
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const [confirming, setConfirming] = React.useState(false)
  const resetButtonRef = React.useRef<HTMLButtonElement>(null)
  const returnFocus = React.useRef(false)
  const confirmId = React.useId()

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next)
    if (!next) setConfirming(false)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!confirming && returnFocus.current) {
      returnFocus.current = false
      resetButtonRef.current?.focus()
    }
  }, [confirming])

  const armed = modified ?? (slow || failNext)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            data-slot="demo-controls-trigger"
            variant="outline"
            size="sm"
            title={openLabel}
            aria-label={networkName ? `${openLabel} · ${networkName}` : openLabel}
            className="px-2.5 sm:px-3"
          >
            {networkName ? (
              <>
                <span
                  aria-hidden="true"
                  className="hidden size-2 rounded-full bg-success sm:block"
                />
                <span className="hidden sm:inline">{networkName}</span>
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-border sm:block"
                />
              </>
            ) : null}
            <SlidersHorizontalIcon aria-hidden="true" />
            {armed ? (
              <span
                data-slot="demo-controls-indicator"
                aria-hidden="true"
                className="size-2 rounded-full bg-warning"
              />
            ) : null}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        data-slot="demo-controls"
        closeLabel={closeLabel}
        className={cn("sm:max-w-md", className)}
        {...props}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{resetHint}</DialogDescription>
        </DialogHeader>

        <div
          data-slot="demo-controls-toggles"
          className="flex flex-col divide-y rounded-2xl border"
        >
          <DemoControlsToggle
            label={slowLabel}
            hint={slowHint}
            checked={slow}
            onCheckedChange={onSlowChange}
          />
          <DemoControlsToggle
            label={failNextLabel}
            hint={failNextHint}
            checked={failNext}
            onCheckedChange={onFailNextChange}
          />
          {children}
        </div>

        {onReset ? (
          <div data-slot="demo-controls-reset" className="rounded-2xl border p-4">
            {!confirming ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">{resetHint}</p>
                <Button
                  ref={resetButtonRef}
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirming(true)}
                  className="shrink-0"
                >
                  <RotateCcwIcon aria-hidden="true" />
                  {resetLabel}
                </Button>
              </div>
            ) : (
              <div
                data-slot="demo-controls-reset-confirm"
                role="group"
                aria-labelledby={confirmId}
                className="flex flex-col gap-3"
              >
                <p id={confirmId} className="font-bold">
                  {resetConfirmTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resetConfirmBody}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    autoFocus
                    onClick={() => {
                      onReset()
                      setOpen(false)
                    }}
                  >
                    {resetConfirmLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      returnFocus.current = true
                      setConfirming(false)
                    }}
                  >
                    {cancelLabel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { DemoControls, DemoControlsToggle }
