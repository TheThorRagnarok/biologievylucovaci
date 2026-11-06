import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Bladder } from '../components/Bladder'
import type { Mood } from '../components/Character'
import { DPad } from '../components/DPad'
import { MazeView, type MazeHandle } from '../components/MazeView'
import { ZoneIcon } from '../components/Organs'
import { QuestionSheet } from '../components/QuestionSheet'
import { QUESTIONS_PER_GAME } from '../data/questions'
import { ALLOWED_MISTAKES, useGame } from '../game/store'
import { ZONES } from '../game/zones'
import { toast } from 'sonner'
import { confirmQuit } from '../lib/notify'

export function GameScreen() {
  const maze = useGame((s) => s.maze)!
  const phase = useGame((s) => s.phase)
  const deck = useGame((s) => s.deck)
  const answers = useGame((s) => s.answers)
  const current = useGame((s) => s.current)
  const wrong = useGame((s) => s.wrong)
  const difficulty = useGame((s) => s.difficulty)
  const openQuestion = useGame((s) => s.openQuestion)
  const reachExit = useGame((s) => s.reachExit)
  const finish = useGame((s) => s.finish)
  const backToMenu = useGame((s) => s.backToMenu)

  const allowed = ALLOWED_MISTAKES[difficulty]
  const mazeRef = useRef<MazeHandle>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const [hudH, setHudH] = useState(0)
  const [zone, setZone] = useState(0)
  const [hint, setHint] = useState(true)
  const [flash, setFlash] = useState<Mood | null>(null)

  useLayoutEffect(() => {
    const el = hudRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHudH(el.getBoundingClientRect().height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // konec hry: nejdřív nechat doběhnout komickou animaci, pak výsledky
  useEffect(() => {
    if (phase !== 'accident' && phase !== 'celebrate') return
    toast.dismiss() // komická scéna má mít obrazovku pro sebe
    const t = window.setTimeout(finish, phase === 'accident' ? 3000 : 1900)
    return () => window.clearTimeout(t)
  }, [phase, finish])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 1300)
    return () => window.clearTimeout(t)
  }, [flash])

  const onAnswered = useCallback((correct: boolean) => setFlash(correct ? 'happy' : 'desperate'), [])

  const fill = wrong / (allowed + 1)
  const baseMood: Mood = wrong >= allowed ? 'desperate' : fill >= 0.45 ? 'worried' : 'idle'
  const mood: Mood = phase === 'accident' ? 'ashamed' : phase === 'celebrate' ? 'happy' : (flash ?? baseMood)
  const activeCheckpoint = answers.length < QUESTIONS_PER_GAME ? maze.checkpoints[answers.length] : null
  const z = ZONES[zone]

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <MazeView
          ref={mazeRef}
          maze={maze}
          activeCheckpoint={phase === 'accident' ? null : activeCheckpoint}
          cleared={maze.checkpoints.slice(0, answers.length)}
          mood={mood}
          accident={phase === 'accident'}
          enabled={phase === 'playing'}
          insetTop={hudH}
          onCheckpoint={openQuestion}
          onExit={reachExit}
          onZone={setZone}
          onFirstMove={() => setHint(false)}
        />

        {/* HUD: průhledná vrstva, labyrint pod ní pokračuje */}
        <div ref={hudRef} className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3" style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}>
          <div className="glass pointer-events-auto mx-auto flex max-w-[560px] items-center gap-3 rounded-[24px] py-2 pl-2 pr-3">
            <button
              type="button"
              aria-label="Ukončit hru"
              onClick={() => confirmQuit(backToMenu)}
              className="press grid size-10 shrink-0 place-items-center rounded-full bg-ink/6 text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[12px] font-semibold text-ink-soft">Otázka</span>
                <span className="font-display text-[20px] font-extrabold tabular-nums leading-none tracking-[-0.02em] text-ink">
                  {current !== null ? current + 1 : Math.min(answers.length + 1, QUESTIONS_PER_GAME)}
                  <span className="text-ink-soft/70">/{QUESTIONS_PER_GAME}</span>
                </span>
              </div>
              <div className="mt-1.5 flex gap-[3px]" aria-hidden="true">
                {deck.map((_, i) => {
                  const a = answers[i]
                  return (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${a ? (a.correct ? 'bg-ok' : 'bg-bad') : 'bg-ink/12'}`}
                    />
                  )
                })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2" aria-label={`Chyby ${wrong} z ${allowed} povolených`}>
              <div className="text-right">
                <div className="text-[12px] font-semibold text-ink-soft">Měchýř</div>
                <div className={`font-display text-[17px] font-extrabold tabular-nums leading-none ${wrong >= allowed ? 'text-bad' : 'text-ink'}`}>
                  {wrong > allowed ? 'Plný' : `${wrong}/${allowed}`}
                </div>
              </div>
              <Bladder fill={Math.min(1, fill + (phase === 'accident' ? 1 : 0))} size={36} critical={wrong >= allowed} pulseKey={wrong} />
            </div>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={z.id}
              className="glass pointer-events-none mx-auto mt-2 flex w-fit max-w-full items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 sm:max-w-[560px]"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <ZoneIcon zone={z} size={20} />
              <span className="shrink-0 whitespace-nowrap font-display text-[14px] font-bold tracking-[-0.01em] text-ink">{z.name}</span>
              <span className="hidden min-w-0 truncate text-[12.5px] text-ink-soft min-[360px]:block">{z.fact}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hint && phase === 'playing' && (
            <motion.div
              className="glass pointer-events-none absolute inset-x-0 bottom-4 z-10 mx-auto w-fit rounded-full px-4 py-2 text-[14px] font-semibold text-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.3 }}
            >
              Táhni prstem nebo použij šipky
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'accident' && <Burst key="acc" tone="bad" title="Reflex přebil svěrač!" subtitle="Měchýř to nevydržel." />}
          {phase === 'celebrate' && <Burst key="win" tone="ok" title="Až na WC a v suchu!" subtitle="Všech 20 otázek za tebou." />}
        </AnimatePresence>
      </div>

      <div
        className="relative z-10 flex shrink-0 justify-center border-t border-ink/6 bg-paper/90 pt-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <DPad target={mazeRef} disabled={phase !== 'playing'} />
      </div>

      <AnimatePresence>
        {current !== null && <QuestionSheet key={current} item={deck[current]} number={current + 1} onAnswered={onAnswered} />}
      </AnimatePresence>
    </div>
  )
}

function Burst({ tone, title, subtitle }: { tone: 'ok' | 'bad'; title: string; subtitle: string }) {
  return (
    <>
      <motion.div
        className={`pointer-events-none absolute inset-0 z-20 ${tone === 'bad' ? 'bg-amber/25' : 'bg-ok/10'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-30 mx-auto w-fit px-6 text-center"
        initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.45, duration: 0.6, delay: 0.35 }}
      >
        <div className={`comic-burst rounded-[26px] px-5 py-3.5 ${tone === 'bad' ? 'bg-amber' : 'bg-ok text-white'}`}>
          <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.025em]">{title}</p>
          <p className={`mt-1.5 text-[14px] font-semibold ${tone === 'bad' ? 'text-ink/75' : 'text-white/85'}`}>{subtitle}</p>
        </div>
      </motion.div>
    </>
  )
}
