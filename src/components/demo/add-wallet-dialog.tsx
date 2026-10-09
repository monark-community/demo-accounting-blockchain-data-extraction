"use client"

import { PlusIcon } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from "@/i18n/t"
import { isOwnWallet } from "@/lib/demo/classify"
import { isAddress } from "@/lib/demo/network"
import type { Books, BooksWallet } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

export function AddWalletDialog({ books, disabled, onAdd }: { books: Books; disabled: boolean; onAdd: (w: BooksWallet) => void }) {
  const { app } = useAppCopy()
  const b = app.books
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const a = address.trim()
    if (!isAddress(a)) return setError(app.start.invalid)
    if (isOwnWallet(a, books)) return setError(b.already)
    onAdd({ address: a, name: name.trim() || t(b.walletLabel, { n: books.wallets.length + 1 }) })
    setOpen(false)
    setAddress("")
    setName("")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="h-8">
          <PlusIcon aria-hidden="true" />
          {b.add}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={app.close}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{b.addTitle}</DialogTitle>
            <DialogDescription className="sr-only">{b.addTitle}</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="add-address">
              {b.addLabel}
            </Label>
            <Input
              id="add-address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setError(null)
              }}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "add-error" : undefined}
              className="mt-2 rounded-full px-4 font-mono text-sm"
            />
            <FieldError id="add-error" className="mt-2">
              {error}
            </FieldError>
          </div>
          <div>
            <Label htmlFor="add-name">
              {b.addName}
            </Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={b.addNamePlaceholder}
              maxLength={32}
              className="mt-2 rounded-full px-4"
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {app.sheet.cancel}
            </Button>
            <Button type="submit">{b.addSubmit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
