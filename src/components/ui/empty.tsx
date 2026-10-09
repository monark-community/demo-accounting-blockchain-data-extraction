import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const emptyVariants = cva(
  "group/empty flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-dashed text-sm text-muted-foreground",
  {
    variants: {
      align: {
        center: "items-center text-center",
        start: "items-start text-left",
      },
      size: {
        sm: "p-5",
        default: "px-4 py-8 sm:p-8",
        lg: "gap-4 rounded-3xl p-6 sm:p-10",
      },
    },
    defaultVariants: { align: "center", size: "default" },
  }
)

/**
 * Dashed placeholder for a list, table or panel with nothing in it yet.
 * Compose EmptyMedia, EmptyTitle, EmptyDescription and EmptyContent (actions)
 * inside. Pass `role="status"` when it replaces results the user just
 * filtered away, so the change is announced.
 */
function Empty({
  className,
  align = "center",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      data-slot="empty"
      data-align={align}
      data-size={size}
      className={cn(emptyVariants({ align, size }), className)}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-[48ch] flex-col gap-1 group-data-[align=center]/empty:items-center",
        className
      )}
      {...props}
    />
  )
}

/** Icon or illustration above the title. Decorative: rendered aria-hidden. */
function EmptyMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & { variant?: "icon" | "plain" }) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === "icon" &&
          "size-11 rounded-full bg-muted text-foreground [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-title"
      className={cn(
        "text-base font-bold text-foreground group-data-[size=lg]/empty:text-lg",
        className
      )}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-pretty text-muted-foreground [&>a]:font-semibold [&>a]:text-primary-ink [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

/** Action slot: buttons or links, wrapped in a row. */
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "mt-1 flex flex-wrap items-center gap-2 group-data-[align=center]/empty:justify-center",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  emptyVariants,
}
