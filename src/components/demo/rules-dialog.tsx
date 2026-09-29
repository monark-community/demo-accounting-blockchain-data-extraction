"use client"

import { ListChecksIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { t } from "@/i18n/t"
import { nameOf } from "@/lib/demo/classify"
import { sameAddress } from "@/lib/demo/network"
import { removeRule } from "@/lib/demo/ops"
import type { Books, Entry } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { CategoryChip } from "./bits"

export function RulesDialog({ books, entries }: { books: Books; entries: Entry[] }) {
  const { app } = useAppCopy()
  const r = app.rules
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <ListChecksIcon aria-hidden="true" />
          {r.button}
          {books.rules.length ? <span className="text-muted-foreground tabular-nums">{books.rules.length}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={app.close} className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{r.title}</DialogTitle>
          <DialogDescription className="sr-only">{r.title}</DialogDescription>
        </DialogHeader>
        {books.rules.length ? (
          <ul className="divide-y rounded-2xl border">
            {books.rules.map((rule) => {
              const name = nameOf(rule.address, books) ?? shortAddress(rule.address)
              const n = entries.filter((e) => sameAddress(e.counterparty, rule.address)).length
              return (
                <li key={rule.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <CategoryChip category={rule.category} label={app.categories[rule.category]} />
                      {t(r.applies, { n })}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeRule(rule.id)} aria-label={t(r.remove, { name })}>
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{r.empty}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
