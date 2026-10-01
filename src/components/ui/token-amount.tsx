"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function formatBaseUnits(
  value: bigint | string | number,
  decimals: number,
  maxFractionDigits: number,
  locale?: string
) {
  const raw = typeof value === "bigint" ? value : BigInt(value)
  const negative = raw < 0n
  const abs = negative ? -raw : raw
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const frac = abs % base

  const nf = new Intl.NumberFormat(locale)
  const wholeStr = nf.format(whole)
  const sep = nf.formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? "."
  if (frac === 0n || maxFractionDigits === 0) {
    return `${negative ? "-" : ""}${wholeStr}`
  }
  const fracStr = frac
    .toString()
    .padStart(decimals, "0")
    .slice(0, maxFractionDigits)
    .replace(/0+$/, "")
  return fracStr
    ? `${negative ? "-" : ""}${wholeStr}${sep}${fracStr}`
    : `${negative ? "-" : ""}${wholeStr}`
}

function formatUsd(
  value: number,
  currency: string,
  locale?: string,
  fractionDigits = 2
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

function TokenAmount({
  value,
  decimals = 18,
  symbol,
  fractionDigits = 4,
  locale,
  usdValue,
  usdCurrency = "USD",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  value: bigint | string | number
  decimals?: number
  symbol?: string
  fractionDigits?: number
  locale?: string
  usdValue?: number
  usdCurrency?: string
}) {
  const formatted = formatBaseUnits(value, decimals, fractionDigits, locale)

  return (
    <span
      data-slot="token-amount"
      className={cn("inline-flex flex-col leading-tight", className)}
      {...props}
    >
      <span className="inline-flex items-baseline gap-1 font-mono tabular-nums">
        <span>{formatted}</span>
        {symbol && (
          <span className="text-muted-foreground text-[0.85em] font-sans">
            {symbol}
          </span>
        )}
      </span>
      {typeof usdValue === "number" && (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatUsd(usdValue, usdCurrency, locale)}
        </span>
      )}
    </span>
  )
}

export { TokenAmount, formatBaseUnits, formatUsd }
