import { motion } from 'motion/react'
import { Bladder } from '../components/Bladder'
import { Character, Puddle } from '../components/Character'
import { CATEGORY_LABEL, QUESTIONS_PER_GAME } from '../data/questions'
import { loadStats } from '../game/stats'
import { ALLOWED_MISTAKES, useGame } from '../game/store'

const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function EndScreen() {
  const outcome = useGame((s) => s.outcome)
  const answers = useGame((s) => s.answers)
  const difficulty = useGame((s) => s.difficulty)
  const startedAt = useGame((s) => s.startedAt)
  const endedAt = useGame((s) => s.endedAt)
  const isRecord = useGame((s) => s.isRecord)
  const startGame = useGame((s) => s.startGame)
  const backToMenu = useGame((s) => s.backToMenu)

  const won = outcome === 'won'
  const correct = answers.filter((a) => a.correct).length
  const mistakes = answers.filter((a) => !a.correct)
  const allowed = ALLOWED_MISTAKES[difficulty]
  const stats = loadStats()
  const accuracy = answers.length ? Math.round((correct / answers.length) * 100) : 0

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-area flex-1 overflow-y-auto" style={{ paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))' }}>
        <div className="mx-auto max-w-[560px] px-5 pb-6">
          <div className="flex items-end gap-4">
            <motion.div
              className="relative w-[88px] shrink-0"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
            >
              <Character mood={won ? 'happy' : 'ashamed'} className="block h-auto w-full" />
              {!won && <Puddle />}
            </motion.div>
            <div className="pb-1">
              <p className="text-[13px] font-semibold text-ink-soft">{won ? 'Výhra' : 'Konec hry'}</p>
              <h1 className="mt-0.5 text-balance font-display text-[32px] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
                {won ? 'Až na WC a v suchu!' : 'Ups… nestihlo se to.'}
              </h1>
            </div>
          </div>
          <p className={`${won ? 'mt-4' : 'mt-7'} text-[15.5px] leading-[1.45] text-ink-soft`}>
            {won
              ? 'Celá cesta moči je za tebou: od glomerulu přes Henleovu kličku a močovod až po močovou trubici.'
              : `Měchýř unesl ${allowed} chyb, tahle byla navíc. Reflex přebil svěrač, přesně jak se píše v učivu.`}
          </p>

          {isRecord && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/35 px-3 py-1.5 text-[13.5px] font-bold text-ink">
              Nový rekord na obtížnost {difficulty === 'muz' ? 'Muž' : 'Žena'}
            </p>
          )}

          <dl className="mt-5 grid grid-cols-3 gap-2">
            <Stat label="Správně" value={`${correct}/${QUESTIONS_PER_GAME}`} tone="ok" />
            <Stat label="Chyby" value={`${mistakes.length}`} tone="bad" extra={<Bladder fill={Math.min(1, mistakes.length / (allowed + 1))} size={18} />} />
            <Stat label="Čas" value={fmtTime(endedAt - startedAt)} />
          </dl>
          <p className="mt-2 text-[13px] tabular-nums text-ink-soft">
            Úspěšnost {accuracy} % ze zodpovězených · rekord {stats.best[difficulty]}/{QUESTIONS_PER_GAME} · odehráno {stats.played}×
          </p>

          <h2 className="mt-7 font-display text-[20px] font-bold tracking-[-0.015em] text-ink">
            {mistakes.length ? 'Na tohle se ještě mrkni' : 'Bez jediné chyby'}
          </h2>
          {mistakes.length === 0 ? (
            <p className="mt-2 text-[15px] leading-snug text-ink-soft">Všechny odpovědi seděly. Tvoje nefrony jsou na test v top formě.</p>
          ) : (
            <ol className="mt-3 grid gap-2.5">
              {mistakes.map(({ question, chosen }) => (
                <li key={question.id} className="rounded-[20px] bg-white/70 p-3.5 ring-1 ring-ink/6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-soft">
                    {CATEGORY_LABEL[question.kategorie] ?? question.kategorie}
                  </p>
                  <p className="mt-1 text-pretty font-display text-[16.5px] font-bold leading-snug tracking-[-0.01em] text-ink">{question.otazka}</p>
                  <div className="mt-2.5 grid gap-1.5 text-[14.5px] leading-snug">
                    <p className="flex gap-2 rounded-[12px] bg-bad/8 px-2.5 py-1.5 text-bad">
                      <span className="shrink-0 font-bold">Tvoje:</span>
                      <span className="line-through decoration-bad/40">{question.moznosti[chosen]}</span>
                    </p>
                    <p className="flex gap-2 rounded-[12px] bg-ok/10 px-2.5 py-1.5 text-ok">
                      <span className="shrink-0 font-bold">Správně:</span>
                      <span className="text-ink">{question.moznosti[question.correct]}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-ink/6 bg-paper/90 px-5 pt-3 backdrop-blur-xl" style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto flex max-w-[560px] gap-2.5">
          <button type="button" onClick={backToMenu} className="press h-14 rounded-full bg-white/80 px-5 text-[15px] font-semibold text-ink ring-1 ring-ink/10">
            Obtížnost
          </button>
          <button type="button" onClick={startGame} className="press h-14 flex-1 rounded-full bg-ink font-display text-[18px] font-bold tracking-[-0.01em] text-cream shadow-[0_12px_24px_-12px_rgba(42,26,22,.7)]">
            Hrát znovu
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone, extra }: { label: string; value: string; tone?: 'ok' | 'bad'; extra?: React.ReactNode }) {
  return (
    <div className="rounded-[18px] bg-white/70 px-3 py-2.5 ring-1 ring-ink/6">
      <dt className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft">
        {label}
        {extra}
      </dt>
      <dd className={`mt-1 font-display text-[24px] font-extrabold tabular-nums leading-none tracking-[-0.02em] ${tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  )
}
