"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { errorCopy } from "@/i18n/dictionaries/errors"

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() ?? ""
  const copy = pathname.startsWith("/fr") ? errorCopy.fr : errorCopy.en
  return (
    <section role="alert" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold tracking-display">{copy.title}</h1>
      <p className="mt-4 text-muted-foreground">{copy.body}</p>
      <Button className="mt-8" size="lg" onClick={reset}>
        {copy.retry}
      </Button>
    </section>
  )
}
