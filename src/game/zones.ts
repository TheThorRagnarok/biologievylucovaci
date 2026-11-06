/**
 * Labyrint je cesta moči shora dolů. Pásy odpovídají orgánům z prezentace,
 * podtitulky jsou fakta přímo ze slidů.
 */
export interface Zone {
  id: 'kura' | 'dren' | 'panvicka' | 'mocovod' | 'mechyr'
  name: string
  fact: string
  tissue: string
  deep: string
}

export const ZONES: Zone[] = [
  { id: 'kura', name: 'Ledvinová kůra', fact: 'Glomerulus v Bowmanově váčku filtruje krev', tissue: '#F7C2AE', deep: '#E0927C' },
  { id: 'dren', name: 'Ledvinová dřeň', fact: 'Henleova klička vniká do dřeně a vrací se', tissue: '#F0A595', deep: '#CF7465' },
  { id: 'panvicka', name: 'Ledvinová pánvička', fact: 'Kalichy sbírají definitivní moč', tissue: '#F4B2A9', deep: '#D5847D' },
  { id: 'mocovod', name: 'Močovod', fact: 'Hladká svalovina, peristaltické stahy', tissue: '#F6C49E', deep: '#D99566' },
  { id: 'mechyr', name: 'Močový měchýř', fact: 'Uložen v pánvi, ústí hlídá svěrač', tissue: '#F3B6BE', deep: '#D2828E' },
]

export const zoneForRow = (row: number, rows: number) =>
  Math.min(ZONES.length - 1, Math.floor((row / rows) * ZONES.length))
