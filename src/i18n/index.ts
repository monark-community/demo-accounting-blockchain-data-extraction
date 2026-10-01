import en, { type Dictionary } from "./dictionaries/en"
import fr from "./dictionaries/fr"
import type { Locale } from "./config"

export type { Dictionary }
export { t } from "./t"

const dictionaries: Record<Locale, Dictionary> = { en, fr }

/** Server-side only: client components receive the slices they need as props or context. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
