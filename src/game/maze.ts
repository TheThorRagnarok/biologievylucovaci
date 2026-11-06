import { createRng, shuffle } from './random'

export type Dir = 'N' | 'E' | 'S' | 'W'

export const DIRS: Record<Dir, { bit: number; dx: number; dy: number; opp: Dir }> = {
  N: { bit: 1, dx: 0, dy: -1, opp: 'S' },
  E: { bit: 2, dx: 1, dy: 0, opp: 'W' },
  S: { bit: 4, dx: 0, dy: 1, opp: 'N' },
  W: { bit: 8, dx: -1, dy: 0, opp: 'E' },
}
export const DIR_LIST: Dir[] = ['N', 'E', 'S', 'W']

export interface Maze {
  w: number
  h: number
  /** bitmaska otevřených průchodů pro každou buňku (N=1, E=2, S=4, W=8) */
  open: number[]
  start: number
  exit: number
  /** jediná cesta start → exit (perfektní labyrint = právě jedna) */
  solution: number[]
  /** buňky s otázkou, v pořadí, v jakém je hráč potká */
  checkpoints: number[]
  seed: number
}

export const isOpen = (m: Maze, cell: number, d: Dir) => (m.open[cell] & DIRS[d].bit) !== 0
export const neighbor = (m: Maze, cell: number, d: Dir) => cell + DIRS[d].dx + DIRS[d].dy * m.w
export const degree = (m: Maze, cell: number) =>
  DIR_LIST.reduce((n, d) => n + (isOpen(m, cell, d) ? 1 : 0), 0)

/** Recursive backtracker (iterativně): dlouhé klikaté chodby, ideální pro "tubuly". */
function carve(w: number, h: number, rand: () => number): number[] {
  const open = new Array<number>(w * h).fill(0)
  const seen = new Array<boolean>(w * h).fill(false)
  const stack = [0]
  seen[0] = true
  while (stack.length) {
    const cell = stack[stack.length - 1]
    const x = cell % w
    const y = Math.floor(cell / w)
    const options = shuffle(DIR_LIST, rand).filter((d) => {
      const nx = x + DIRS[d].dx
      const ny = y + DIRS[d].dy
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[nx + ny * w]
    })
    if (!options.length) {
      stack.pop()
      continue
    }
    const d = options[0]
    const next = cell + DIRS[d].dx + DIRS[d].dy * w
    open[cell] |= DIRS[d].bit
    open[next] |= DIRS[DIRS[d].opp].bit
    seen[next] = true
    stack.push(next)
  }
  return open
}

function solve(w: number, open: number[], start: number, exit: number): number[] {
  const prev = new Map<number, number>([[start, -1]])
  const queue = [start]
  while (queue.length) {
    const cell = queue.shift()!
    if (cell === exit) break
    for (const d of DIR_LIST) {
      if (!(open[cell] & DIRS[d].bit)) continue
      const n = cell + DIRS[d].dx + DIRS[d].dy * w
      if (!prev.has(n)) {
        prev.set(n, cell)
        queue.push(n)
      }
    }
  }
  const path: number[] = []
  for (let c = exit; c !== -1; c = prev.get(c)!) path.push(c)
  return path.reverse()
}

/**
 * Vytvoří labyrint, jehož jediná cesta k východu je dost dlouhá na to,
 * aby se na ni rovnoměrně vešlo `checkpointCount` otázek.
 */
export function createMaze(w: number, h: number, checkpointCount: number, seed = Date.now()): Maze {
  const minLength = checkpointCount * 3 + 4
  let best: { open: number[]; solution: number[]; seed: number } | null = null
  for (let attempt = 0; attempt < 40; attempt++) {
    const s = (seed + attempt * 7919) >>> 0
    const open = carve(w, h, createRng(s))
    const solution = solve(w, open, 0, w * h - 1)
    if (!best || solution.length > best.solution.length) best = { open, solution, seed: s }
    if (solution.length >= minLength) break
  }
  const { open, solution } = best!
  const L = solution.length
  const step = (L - 1) / (checkpointCount + 1)
  const checkpoints: number[] = []
  for (let i = 1; i <= checkpointCount; i++) {
    const idx = Math.min(L - 2, Math.max(1, Math.round(i * step)))
    checkpoints.push(solution[idx])
  }
  return { w, h, open, start: 0, exit: w * h - 1, solution, checkpoints, seed: best!.seed }
}
