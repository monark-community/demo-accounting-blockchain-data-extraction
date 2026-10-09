import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const sectionTitleVariants = cva("font-heading tracking-display text-balance", {
  variants: {
    size: {
      sm: "text-2xl font-bold sm:text-[1.75rem]",
      default: "text-3xl font-bold sm:text-[2rem]",
      lg: "text-[2.25rem] leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.75rem]",
    },
  },
  defaultVariants: { size: "default" },
})

/**
 * Landing-page section heading: an optional uppercase eyebrow, the display
 * title, an optional lead paragraph and an optional action (usually a link)
 * that sits to the right on wide screens. The heading level is set with `as`
 * independently of the visual `size`, so the document outline stays correct.
 * Give the title an `id` (via `titleId`) and point the section's
 * `aria-labelledby` at it.
 */
function SectionHeading({
  className,
  as: Heading = "h2",
  size = "default",
  align = "start",
  eyebrow,
  eyebrowTone = "muted",
  title,
  titleId,
  lead,
  action,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof sectionTitleVariants> & {
    as?: "h1" | "h2" | "h3"
    align?: "start" | "center"
    eyebrow?: React.ReactNode
    eyebrowTone?: "muted" | "primary"
    title: React.ReactNode
    titleId?: string
    lead?: React.ReactNode
    action?: React.ReactNode
  }) {
  const centered = align === "center"
  return (
    <div
      data-slot="section-heading"
      data-align={align}
      className={cn(
        "flex flex-col gap-4",
        action && !centered && "md:flex-row md:items-end md:justify-between md:gap-8",
        centered && "items-center text-center",
        className
      )}
      {...props}
    >
      <div className={cn("flex min-w-0 flex-col", centered && "items-center")}>
        {eyebrow ? (
          <p
            data-slot="section-heading-eyebrow"
            className={cn(
              "eyebrow mb-3",
              eyebrowTone === "primary" ? "text-primary-ink" : "text-muted-foreground"
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={titleId}
          data-slot="section-heading-title"
          className={cn(sectionTitleVariants({ size }), action && !centered && "max-w-2xl")}
        >
          {title}
        </Heading>
        {lead ? (
          <p
            data-slot="section-heading-lead"
            className={cn(
              "mt-4 max-w-[56ch] text-pretty text-muted-foreground",
              size === "lg" && "text-lg sm:text-xl"
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>
      {action ? (
        <div data-slot="section-heading-action" className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  )
}

export { SectionHeading, sectionTitleVariants }
