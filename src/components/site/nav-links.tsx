"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
}

function isActive(pathname: string, href: string) {
  // Home is only active on the exact locale root.
  if (/^\/[a-z]{2}$/.test(href)) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLinks({
  items,
  className,
  itemClassName,
  onNavigate,
}: {
  items: NavItem[]
  className?: string
  itemClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center text-sm font-semibold transition-colors duration-150",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                itemClassName
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
