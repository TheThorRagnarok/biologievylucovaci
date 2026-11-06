import { create } from 'zustand'
import { QUESTIONS, QUESTIONS_PER_GAME, type Question } from '../data/questions'
import { createMaze, type Maze } from './maze'
import { shuffle } from './random'
import { recordGame } from './stats'

export type Difficulty = 'muz' | 'zena'
export type Screen = 'menu' | 'game' | 'end'
export type Phase = 'playing' | 'question' | 'accident' | 'celebrate'

/** Kolik chyb měchýř unese. Další chyba nad limit = game over. */
export const ALLOWED_MISTAKES: Record<Difficulty, number> = { muz: 7, zena: 5 }

export const MAZE_COLS = 8
export const MAZE_ROWS = 15

export interface DeckItem {
  question: Question
  /** pořadí, ve kterém se možnosti zobrazí (indexy do question.moznosti) */
  order: number[]
}

export interface AnswerRecord {
  question: Question
  chosen: number // index do question.moznosti
  correct: boolean
}

interface GameState {
  screen: Screen
  phase: Phase
  difficulty: Difficulty
  maze: Maze | null
  deck: DeckItem[]
  answers: AnswerRecord[]
  /** index otázky v balíčku, která je právě otevřená */
  current: number | null
  wrong: number
  startedAt: number
  endedAt: number
  outcome: 'won' | 'lost' | null
  isRecord: boolean

  setDifficulty: (d: Difficulty) => void
  startGame: () => void
  openQuestion: () => void
  answer: (chosen: number) => { correct: boolean; overflow: boolean }
  closeQuestion: () => void
  reachExit: () => void
  finish: () => void
  backToMenu: () => void
}

export const useGame = create<GameState>((set, get) => ({
  screen: 'menu',
  phase: 'playing',
  difficulty: 'muz',
  maze: null,
  deck: [],
  answers: [],
  current: null,
  wrong: 0,
  startedAt: 0,
  endedAt: 0,
  outcome: null,
  isRecord: false,

  setDifficulty: (difficulty) => set({ difficulty }),

  startGame: () => {
    // 20 otázek z 60 bez opakování; možnosti se míchají, aby správná nebyla vždy "B"
    const deck = shuffle(QUESTIONS)
      .slice(0, QUESTIONS_PER_GAME)
      .map((question) => ({ question, order: shuffle([0, 1, 2, 3]) }))
    set({
      screen: 'game',
      phase: 'playing',
      maze: createMaze(MAZE_COLS, MAZE_ROWS, QUESTIONS_PER_GAME, (Math.random() * 2 ** 31) | 0),
      deck,
      answers: [],
      current: null,
      wrong: 0,
      startedAt: Date.now(),
      endedAt: 0,
      outcome: null,
      isRecord: false,
    })
  },

  openQuestion: () => {
    const { answers, phase } = get()
    if (phase !== 'playing' || answers.length >= QUESTIONS_PER_GAME) return
    set({ phase: 'question', current: answers.length })
  },

  answer: (chosen) => {
    const { deck, current, answers, wrong, difficulty } = get()
    if (current === null || answers.length > current) return { correct: false, overflow: false }
    const { question } = deck[current]
    const correct = chosen === question.correct
    const nextWrong = wrong + (correct ? 0 : 1)
    set({ answers: [...answers, { question, chosen, correct }], wrong: nextWrong })
    return { correct, overflow: nextWrong > ALLOWED_MISTAKES[difficulty] }
  },

  closeQuestion: () => {
    const { wrong, difficulty } = get()
    const overflow = wrong > ALLOWED_MISTAKES[difficulty]
    set({ current: null, phase: overflow ? 'accident' : 'playing' })
  },

  reachExit: () => {
    const { answers, phase } = get()
    if (phase !== 'playing' || answers.length < QUESTIONS_PER_GAME) return
    set({ phase: 'celebrate' })
  },

  finish: () => {
    const { phase, answers, difficulty, screen } = get()
    if (screen !== 'game') return
    const won = phase === 'celebrate'
    const correct = answers.filter((a) => a.correct).length
    const { isRecord } = recordGame(difficulty, correct, won)
    set({ screen: 'end', outcome: won ? 'won' : 'lost', endedAt: Date.now(), isRecord })
  },

  backToMenu: () => set({ screen: 'menu', phase: 'playing', current: null }),
}))

if (import.meta.env.DEV) {
  // pro ruční ladění v konzoli: __game.getState()
  ;(window as unknown as { __game: typeof useGame }).__game = useGame
}
