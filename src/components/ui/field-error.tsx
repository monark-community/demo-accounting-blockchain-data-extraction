import * as React from "react"
import { cn } from "cn"
import { CircleAlertIcon } from "lucide-react"

// The inline error under a form control. Give it an id and point the control
// at it with aria-describedby (plus aria-invalid) so the message is read with
// the field. It is a role="alert" live region, so the message is announced
// when it appears. `reserveSpace` keeps an empty one-line region mounted, so
// the layout doesn't jump and the live region already exists when the text
// arrives (the most reliable way to get it announced).
function FieldError({
  className,
  children,
  icon,
  reserveSpace = false,
  ...props
}: React.ComponentProps<"p"> & {
  /** Leading icon; defaults to a circle alert. Pass `false` to hide it. */
  icon?: React.ReactNode | false
  /** Render an empty min-h-5 slot when there is no message. */
  reserveSpace?: boolean
}) {
  const hasMessage =
    children !== null &&
    children !== undefined &&
    children !== false &&
    children !== ""

  if (!hasMessage && !reserveSpace) return null

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn(
        "flex min-h-5 items-start gap-1.5 text-sm font-semibold text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {hasMessage ? (
        <>
          {icon === false ? null : (
            <span
              data-slot="field-error-icon"
              aria-hidden="true"
              className="inline-flex h-5 items-center"
            >
              {icon ?? <CircleAlertIcon />}
            </span>
          )}
          <span data-slot="field-error-message">{children}</span>
        </>
      ) : null}
    </p>
  )
}

export { FieldError }
