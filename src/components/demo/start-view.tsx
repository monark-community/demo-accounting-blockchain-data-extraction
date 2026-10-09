"use client"

import { ArrowRightIcon, GraduationCapIcon, LaptopIcon } from "lucide-react"
import Image from "next/image"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WalletAvatar } from "@/components/ui/wallet"
import { isAddress } from "@/lib/demo/network"
import { SAMPLES } from "@/lib/demo/seed"
import type { SampleId } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

/** The empty-books screen: paste an address or pick a sample. */
export function StartView({ onAddress, onSample }: { onAddress: (address: string) => void; onSample: (id: SampleId) => void }) {
  const { app } = useAppCopy()
  const s = app.start
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isAddress(value)) {
      setError(true)
      return
    }
    onAddress(value.trim())
  }

  const samples: { id: SampleId; icon: typeof LaptopIcon; name: string; body: string }[] = [
    { id: "campus", icon: GraduationCapIcon, name: s.campus.name, body: s.campus.body },
    { id: "lea", icon: LaptopIcon, name: s.lea.name, body: s.lea.body },
  ]

  return (
    <section aria-labelledby="start-title" className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-6 sm:py-12">
      <Image src="/brand/monark-mark.svg" alt="" width={44} height={44} unoptimized className="size-11" />
      <h1 id="start-title" className="mt-5 text-3xl font-extrabold tracking-display sm:text-4xl">
        {s.title}
      </h1>

      <form onSubmit={submit} noValidate className="mt-8">
        <Label htmlFor="address">
          {s.label}
        </Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id="address"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(false)
            }}
            placeholder={s.placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error || undefined}
            aria-describedby={error ? "address-error" : undefined}
            className="h-12 rounded-full px-5 font-mono text-sm"
          />
          <Button type="submit" size="lg">
            {s.submit}
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
        <FieldError id="address-error" reserveSpace className="min-h-7 pt-2">
          {error ? s.invalid : null}
        </FieldError>
      </form>

      <h2 className="eyebrow mt-6 text-muted-foreground">{s.samples}</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {samples.map((sample) => {
          const Icon = sample.icon
          return (
            <li key={sample.id}>
              <button
                type="button"
                onClick={() => onSample(sample.id)}
                className="group flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors duration-150 hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="relative shrink-0">
                  <WalletAvatar address={SAMPLES[sample.id].wallet.address} size={40} />
                  <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border bg-card">
                    <Icon className="size-3 text-primary" aria-hidden="true" />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{sample.name}</span>
                  <span className="block text-sm text-muted-foreground">{sample.body}</span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
