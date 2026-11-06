import type { Difficulty } from './store'

export interface Stats {
  played: number
  wins: number
  best: Record<Difficulty, number>
}

const KEY = 'vylucovaci-labyrint:stats:v1'
const EMPTY: Stats = { played: 0, wins: 0, best: { muz: 0, zena: 0 } }

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(EMPTY)
    const parsed = JSON.parse(raw) as Partial<Stats>
    return {
      played: parsed.played ?? 0,
      wins: parsed.wins ?? 0,
      best: { muz: parsed.best?.muz ?? 0, zena: parsed.best?.zena ?? 0 },
    }
  } catch {
    return structuredClone(EMPTY)
  }
}

/** Vrací aktualizované statistiky a informaci, jestli padl nový rekord. */
export function recordGame(difficulty: Difficulty, correct: number, won: boolean) {
  const stats = loadStats()
  const isRecord = correct > stats.best[difficulty]
  stats.played += 1
  if (won) stats.wins += 1
  if (isRecord) stats.best[difficulty] = correct
  try {
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    /* soukromé okno / zakázané úložiště: hra jede dál i bez statistik */
  }
  return { stats, isRecord }
}
