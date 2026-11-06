import type { Dir } from '../game/maze'
import type { MazeHandle } from './MazeView'

const ROT: Record<Dir, number> = { N: 0, E: 90, S: 180, W: 270 }
const LABEL: Record<Dir, string> = { N: 'Nahoru', E: 'Doprava', S: 'Dolů', W: 'Doleva' }

/** On-screen šipky. Reagují na pointerdown (žádné čekání na "click"), držení = běž dál stejným směrem. */
export function DPad({ target, disabled }: { target: React.RefObject<MazeHandle | null>; disabled: boolean }) {
  const btn = (d: Dir, area: string) => (
    <button
      key={d}
      type="button"
      aria-label={LABEL[d]}
      disabled={disabled}
      style={{ gridArea: area }}
      className="dpad-btn grid size-[58px] place-items-center rounded-[20px] bg-white/80 text-ink shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_6px_14px_-8px_rgba(42,26,22,.5)] ring-1 ring-ink/10 disabled:opacity-40"
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        target.current?.press(d)
      }}
      onPointerUp={() => target.current?.release(d)}
      onPointerCancel={() => target.current?.release(d)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: `rotate(${ROT[d]}deg)` }} aria-hidden="true">
        <path d="M11 4.5 L18 13 H13.6 V18 H8.4 V13 H4Z" fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  )
  return (
    <div
      className="dpad grid gap-1.5"
      style={{ gridTemplateAreas: '". n ." "w . e" ". s ."', gridTemplateColumns: 'repeat(3, 58px)', gridTemplateRows: 'repeat(3, 58px)' }}
    >
      {btn('N', 'n')}
      {btn('W', 'w')}
      <div style={{ gridArea: '2 / 2' }} className="m-auto size-3 rounded-full bg-ink/10" aria-hidden="true" />
      {btn('E', 'e')}
      {btn('S', 's')}
    </div>
  )
}
