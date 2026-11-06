import { useMemo } from 'react'
import { Bladder } from '../components/Bladder'
import { ExcretorySystem } from '../components/Organs'
import { QUESTIONS, QUESTIONS_PER_GAME } from '../data/questions'
import { loadStats } from '../game/stats'
import { ALLOWED_MISTAKES, useGame, type Difficulty } from '../game/store'

const OPTIONS: { id: Difficulty; title: string; bladder: string; size: number; fill: number }[] = [
  { id: 'muz', title: 'Muž', bladder: 'Větší měchýř', size: 46, fill: 0.35 },
  { id: 'zena', title: 'Žena', bladder: 'Menší měchýř', size: 36, fill: 0.5 },
]

export function StartScreen() {
  const difficulty = useGame((s) => s.difficulty)
  const setDifficulty = useGame((s) => s.setDifficulty)
  const startGame = useGame((s) => s.startGame)
  const stats = useMemo(loadStats, [])

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-area flex-1 overflow-y-auto" style={{ paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))' }}>
        <div className="mx-auto max-w-[520px] px-5 pb-6">
          <div className="flex items-start gap-2">
            <h1 className="flex-1 pt-1 font-display text-[clamp(34px,10vw,46px)] font-extrabold leading-[0.95] tracking-[-0.035em] text-ink">
              Vylučovací
              <br />
              labyrint
            </h1>
            <ExcretorySystem className="-mr-2 -mt-1 aspect-[260/230] w-[44%] max-w-[210px] shrink-0" />
          </div>
          <p className="mt-2 max-w-[36ch] text-[16px] leading-[1.45] text-ink-soft">
            Proběhni cestu moči od glomerulu až na WC. Cestou tě zastaví {QUESTIONS_PER_GAME} otázek z vylučovací soustavy.
          </p>

          <ul className="mt-4 grid gap-2">
            <li className="flex items-center gap-3 rounded-[18px] bg-white/60 px-3 py-2.5 ring-1 ring-ink/6">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber font-display text-[18px] font-extrabold text-ink ring-2 ring-ink">?</span>
              <span className="text-[15px] leading-snug text-ink">Na každém filtru odpověz na otázku A, B, C nebo D.</span>
            </li>
            <li className="flex items-center gap-3 rounded-[18px] bg-white/60 px-3 py-2.5 ring-1 ring-ink/6">
              <span className="grid size-9 shrink-0 place-items-center">
                <Bladder fill={0.6} size={28} />
              </span>
              <span className="text-[15px] leading-snug text-ink">Každá chyba přileje do měchýře. Když přeteče, je konec hry.</span>
            </li>
          </ul>

          <h2 className="mt-5 font-display text-[19px] font-bold tracking-[-0.015em] text-ink">Obtížnost</h2>
          <div role="radiogroup" aria-label="Obtížnost" className="mt-2.5 grid grid-cols-2 gap-2.5">
            {OPTIONS.map((o) => {
              const selected = difficulty === o.id
              const allowed = ALLOWED_MISTAKES[o.id]
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDifficulty(o.id)}
                  className={`press relative flex flex-col items-start rounded-[22px] p-3.5 text-left transition-[background-color,box-shadow] duration-150 ${
                    selected ? 'bg-white shadow-[0_10px_24px_-14px_rgba(42,26,22,.55)] ring-[2.5px] ring-ink' : 'bg-white/50 ring-1 ring-ink/10'
                  }`}
                >
                  <div className="flex h-[52px] items-end">
                    <Bladder fill={o.fill} size={o.size} />
                  </div>
                  <span className="mt-2 font-display text-[22px] font-extrabold leading-none tracking-[-0.02em] text-ink">{o.title}</span>
                  <span className="mt-1 text-[13px] font-semibold text-ink-soft">{o.bladder}</span>
                  <span className="mt-2 text-[14px] leading-snug text-ink">
                    <b className="tabular-nums">{allowed} chyb</b> projde, {allowed + 1}. znamená konec
                  </span>
                  {selected && (
                    <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-ink text-cream" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2.5 6.5l2.2 2.2 4.8-5.2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-2.5 text-[13px] leading-snug text-ink-soft">
            Obtížnost jen mění, kolik chyb měchýř unese. Inspirace přímo z učiva: muži mají v průměru větší kapacitu měchýře.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-ink/6 bg-paper/90 px-5 pt-3 backdrop-blur-xl" style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto max-w-[520px]">
          <button type="button" onClick={startGame} className="press h-14 w-full rounded-full bg-ink font-display text-[18px] font-bold tracking-[-0.01em] text-cream shadow-[0_12px_24px_-12px_rgba(42,26,22,.7)]">
            Start
          </button>
          <p className="mt-2 text-center text-[12.5px] tabular-nums text-ink-soft">
            {stats.played > 0
              ? `Odehráno ${stats.played}× · výher ${stats.wins} · rekord ${Math.max(stats.best.muz, stats.best.zena)}/${QUESTIONS_PER_GAME}`
              : `${QUESTIONS.length} otázek v zásobě, každá hra vybere ${QUESTIONS_PER_GAME} náhodně`}
          </p>
        </div>
      </div>
    </div>
  )
}
