"use client"

import { useEffect, useRef, useState } from "react"

export { CategoryChip } from "./category-chip"

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return true
  }
}

/** Counts from the previous value to the new one (the "totals settle" moment). */
export function useAnimatedNumber(target: number, duration = 700): number {
  const [value, setValue] = useState(target)
  const from = useRef(target)
  const raf = useRef(0)

  useEffect(() => {
    const start = from.current
    if (start === target || prefersReducedMotion()) {
      from.current = target
      raf.current = requestAnimationFrame(() => setValue(target))
      return () => cancelAnimationFrame(raf.current)
    }
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = start + (target - start) * eased
      from.current = v
      setValue(p >= 1 ? target : v)
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}
