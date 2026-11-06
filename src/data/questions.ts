import raw from './questions.json'

export interface Question {
  id: number
  kategorie: string
  otazka: string
  moznosti: [string, string, string, string]
  /** 0-indexovaný index správné odpovědi v `moznosti` */
  correct: number
}

/** Zásobárna 60 otázek, zdroj pravdy je questions.json (beze změn). */
export const QUESTIONS = raw as Question[]

export const QUESTIONS_PER_GAME = 20

export const CATEGORY_LABEL: Record<string, string> = {
  funkce: 'Funkce soustavy',
  dusik: 'Vylučování dusíku',
  fylogeneze: 'Fylogeneze',
  'fylogeneze-ledviny': 'Fylogeneze ledvin',
  'clovek-prehled': 'Soustava člověka',
  'ledviny-anatomie': 'Stavba ledvin',
  'ledviny-funkce': 'Funkce ledvin',
  nefron: 'Nefron',
  movod: 'Močovod',
  mechyr: 'Močový měchýř',
  trubice: 'Močová trubice',
  nemoci: 'Onemocnění',
  selhani: 'Selhání ledvin',
}
