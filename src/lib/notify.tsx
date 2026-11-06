import { toast } from 'sonner'

const CORRECT = [
  'Správně! Teče to dál.',
  'Přesně tak. Nefron by tleskal.',
  'Bez chyby, filtrace proběhla.',
  'Výborně, měchýř v klidu.',
  'Správně! Jako po másle.',
]
const WRONG = [
  'Vedle. Měchýř se plní.',
  'Au, to nebylo ono.',
  'Špatně. Začíná to tlačit.',
  'Chyba. Kape to do měchýře.',
  'Vedle! Rychle hledej WC.',
]
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)]

type Tone = 'ok' | 'bad' | 'warn'

function Card({ tone, title, subtitle }: { tone: Tone; title: string; subtitle?: string }) {
  const color = tone === 'ok' ? 'bg-ok' : tone === 'bad' ? 'bg-bad' : 'bg-amber-deep'
  return (
    <div className="toast-card pointer-events-auto mx-auto flex w-[min(92vw,360px)] items-center gap-3 rounded-[20px] bg-cream/90 px-3.5 py-3 shadow-[0_10px_30px_-12px_rgba(42,26,22,.45)] ring-1 ring-ink/8 backdrop-blur-xl">
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${color} text-white`} aria-hidden="true">
        {tone === 'ok' ? (
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3.2c2.6 3.4 3.8 5.3 3.8 6.9a3.8 3.8 0 0 1-7.6 0c0-1.6 1.2-3.5 3.8-6.9z" fill="currentColor" /></svg>
        )}
      </span>
      <div className="min-w-0">
        <p className="font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{subtitle}</p>}
      </div>
    </div>
  )
}

export function notifyCorrect() {
  toast.custom(() => <Card tone="ok" title={pick(CORRECT)} />, { duration: 1600, id: 'answer' })
}

export function notifyWrong(wrong: number, allowed: number) {
  const left = allowed - wrong
  const subtitle =
    left > 1 ? `Chyby ${wrong} z ${allowed}. Ještě to vydržíš.` : left === 1 ? `Chyby ${wrong} z ${allowed}. Už to hodně tlačí!` : left === 0 ? 'Poslední kapka. Další chyba a je zle!' : 'Měchýř přetekl.'
  toast.custom(() => <Card tone={left <= 0 ? 'warn' : 'bad'} title={left < 0 ? 'Tohle už neudržíš…' : pick(WRONG)} subtitle={subtitle} />, {
    duration: 2400,
    id: 'answer',
  })
}

export function confirmQuit(onQuit: () => void) {
  toast.custom(
    (id) => (
      <div className="pointer-events-auto mx-auto flex w-[min(92vw,360px)] items-center gap-3 rounded-[20px] bg-cream/90 py-2.5 pl-4 pr-2.5 shadow-[0_10px_30px_-12px_rgba(42,26,22,.45)] ring-1 ring-ink/8 backdrop-blur-xl">
        <p className="flex-1 font-display text-[15px] font-bold tracking-[-0.01em] text-ink">Ukončit rozehranou hru?</p>
        <button className="press h-10 rounded-full px-3.5 text-[14px] font-semibold text-ink-soft" onClick={() => toast.dismiss(id)}>
          Hrát dál
        </button>
        <button
          className="press h-10 rounded-full bg-ink px-4 text-[14px] font-semibold text-cream"
          onClick={() => {
            toast.dismiss(id)
            onQuit()
          }}
        >
          Ukončit
        </button>
      </div>
    ),
    { duration: 5000, id: 'quit' },
  )
}
