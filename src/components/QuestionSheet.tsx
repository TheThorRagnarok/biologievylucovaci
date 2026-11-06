import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { CATEGORY_LABEL, QUESTIONS_PER_GAME } from '../data/questions'
import { ALLOWED_MISTAKES, useGame, type DeckItem } from '../game/store'
import { notifyCorrect, notifyWrong } from '../lib/notify'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  item: DeckItem
  number: number
  onAnswered: (correct: boolean) => void
}

/**
 * Spodní "sheet" s otázkou. Vyjíždí zdola a stejnou cestou zajíždí (prostorová konzistence).
 * Po odpovědi ukáže správnou možnost a sám se zavře; ťuknutím se dá pokračovat dřív.
 */
export function QuestionSheet({ item, number, onAnswered }: Props) {
  const answer = useGame((s) => s.answer)
  const closeQuestion = useGame((s) => s.closeQuestion)
  const difficulty = useGame((s) => s.difficulty)
  const [picked, setPicked] = useState<number | null>(null)
  const [delay, setDelay] = useState(0)
  const timer = useRef<number>(0)
  const firstBtn = useRef<HTMLButtonElement>(null)
  const { question, order } = item

  const close = () => {
    window.clearTimeout(timer.current)
    closeQuestion()
  }

  const pick = (displayIdx: number) => {
    if (picked !== null) return
    const original = order[displayIdx]
    setPicked(displayIdx)
    const { correct, overflow } = answer(original)
    const { wrong } = useGame.getState()
    if (correct) notifyCorrect()
    else {
      notifyWrong(wrong, ALLOWED_MISTAKES[difficulty])
      try {
        navigator.vibrate?.(overflow ? [40, 60, 120] : 35)
      } catch {
        /* vibrace nejsou všude */
      }
    }
    onAnswered(correct)
    const ms = correct ? 950 : overflow ? 1600 : 2600
    setDelay(ms)
    timer.current = window.setTimeout(close, ms)
  }

  useEffect(() => {
    firstBtn.current?.focus({ preventScroll: true })
    return () => window.clearTimeout(timer.current)
  }, [])

  // klávesnice: A–D nebo 1–4, Enter = pokračovat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const idx = ['a', 'b', 'c', 'd'].indexOf(k)
      const num = ['1', '2', '3', '4'].indexOf(k)
      if (picked === null && (idx >= 0 || num >= 0)) {
        e.preventDefault()
        pick(idx >= 0 ? idx : num)
      } else if (picked !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const correctDisplay = order.indexOf(question.correct)
  const wasCorrect = picked !== null && picked === correctDisplay

  return (
    <>
      <motion.div
        className="absolute inset-0 z-30 bg-ink/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => picked !== null && close()}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="q-title"
        className="sheet absolute inset-x-0 bottom-0 z-40 mx-auto max-w-[560px] rounded-t-[30px] bg-cream/88 px-4 pt-3 shadow-[0_-18px_50px_-20px_rgba(42,26,22,.55)] ring-1 ring-white/70 backdrop-blur-2xl"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.42 }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/15" aria-hidden="true" />
        <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
          <span className="rounded-full bg-amber/30 px-2.5 py-1 text-ink">
            Otázka {number} z {QUESTIONS_PER_GAME}
          </span>
          <span className="truncate">{CATEGORY_LABEL[question.kategorie] ?? question.kategorie}</span>
        </div>
        <h2 id="q-title" className="mb-4 text-balance font-display text-[21px] font-bold leading-[1.18] tracking-[-0.018em] text-ink">
          {question.otazka}
        </h2>
        <div className="grid gap-2">
          {order.map((optIdx, i) => {
            const isPicked = picked === i
            const isCorrect = i === correctDisplay
            const state =
              picked === null ? 'idle' : isCorrect && isPicked ? 'right' : isPicked ? 'wrong' : isCorrect ? 'reveal' : 'dim'
            return (
              <button
                key={optIdx}
                ref={i === 0 ? firstBtn : undefined}
                type="button"
                disabled={picked !== null}
                onClick={() => pick(i)}
                data-state={state}
                className="option press flex min-h-[54px] w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left text-[16px] leading-snug"
              >
                <span className="option-letter grid size-8 shrink-0 place-items-center rounded-full font-display text-[15px] font-extrabold">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{question.moznosti[optIdx]}</span>
                {state === 'reveal' && <span className="shrink-0 text-[12px] font-bold uppercase tracking-wide text-ok">Správně</span>}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <button type="button" onClick={close} className="press relative mt-3 h-12 w-full overflow-hidden rounded-full bg-ink text-[15px] font-semibold text-cream">
            <span
              className="absolute inset-y-0 left-0 bg-white/14"
              style={{ animation: `countdown ${delay}ms linear forwards` }}
              aria-hidden="true"
            />
            <span className="relative">{wasCorrect ? 'Pokračovat' : 'Jasně, pokračovat'}</span>
          </button>
        )}
      </motion.section>
    </>
  )
}
