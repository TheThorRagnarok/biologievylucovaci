import type { Zone } from '../game/zones'
import { Character } from './Character'

/**
 * Stylizovaná vylučovací soustava pro úvodní obrazovku:
 * 2 fazolovité ledviny → močovody → měchýř → močová trubice.
 * Panáček "sjíždí" pravým močovodem.
 */
export function ExcretorySystem({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 260 230" className="block h-full w-full" role="img" aria-label="Ledviny, močovody a močový měchýř">
        {/* páteř jako jemný orientační motiv */}
        <g opacity=".14">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="121" y={18 + i * 22} width="18" height="15" rx="5" fill="#B9776B" />
          ))}
        </g>
        {/* močovody */}
        <path d="M86 92 C 92 128, 100 150, 112 170" stroke="#E7A07A" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M174 92 C 168 128, 160 150, 148 170" stroke="#E7A07A" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M86 92 C 92 128, 100 150, 112 170" stroke="#FBD9B8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M174 92 C 168 128, 160 150, 148 170" stroke="#FBD9B8" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* ledviny */}
        <Kidney x={34} y={22} />
        <Kidney x={226} y={22} mirror />
        {/* měchýř */}
        <path
          d="M130 158 C 158 158, 172 172, 172 190 C 172 206, 156 214, 140 216 L 136 226 L 124 226 L 120 216 C 104 214, 88 206, 88 190 C 88 172, 102 158, 130 158Z"
          fill="#F6B9C0"
          stroke="#C8737F"
          strokeWidth="3"
        />
        <path d="M94 196 C 100 186, 160 186, 166 196 C 166 206, 150 212, 130 212 C 110 212, 94 206, 94 196Z" fill="#F5C431" opacity=".9" />
        <path d="M100 176 Q104 167 114 164" stroke="#fff" strokeOpacity=".8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
      <div className="absolute left-[60%] top-[50%] w-[11%] animate-[slide_3.2s_ease-in-out_infinite] motion-reduce:animate-none">
        <Character mood="happy" />
      </div>
    </div>
  )
}

function Kidney({ x, y, mirror = false }: { x: number; y: number; mirror?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -1 : 1} 1)`}>
      {/* fazolovitý tvar: kůra */}
      <path
        d="M30 2 C 52 0, 66 22, 64 44 C 62 56, 54 58, 50 54 C 46 50, 44 60, 48 68 C 52 80, 44 98, 26 98 C 6 98, -2 74, 0 50 C 2 22, 12 4, 30 2Z"
        fill="#E8806C"
        stroke="#B85A4C"
        strokeWidth="3"
      />
      {/* dřeň: pyramidy */}
      <g fill="#C9604F" opacity=".75">
        <path d="M14 30 L 34 40 L 16 46Z" />
        <path d="M10 56 L 34 56 L 14 66Z" />
        <path d="M16 78 L 34 68 L 24 88Z" />
      </g>
      {/* pánvička */}
      <path d="M36 40 C 46 42, 50 50, 54 56 C 50 64, 44 70, 36 70 C 30 62, 30 48, 36 40Z" fill="#F2B49E" stroke="#B85A4C" strokeWidth="2" />
      <path d="M18 14 Q 26 8 36 10" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Malé ikony zón labyrintu (24×24). */
export function ZoneIcon({ zone, size = 22 }: { zone: Zone; size?: number }) {
  const s = { stroke: zone.deep, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {zone.id === 'kura' && (
        <>
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M8 12 q2 -4 4 0 t4 0 M9 15 q3 2 6 0 M10 9 q2 -2 4 0" {...s} strokeWidth={1.6} />
        </>
      )}
      {zone.id === 'dren' && <path d="M7 3 V15 a5 5 0 0 0 10 0 V3" {...s} strokeWidth={3} />}
      {zone.id === 'panvicka' && (
        <>
          <path d="M3 5 C 6 9, 9 11, 10.5 13 V21 M21 5 C 18 9, 15 11, 13.5 13 V21" {...s} />
          <path d="M12 3 V9" {...s} />
        </>
      )}
      {zone.id === 'mocovod' && <path d="M8 2 C 16 6, 4 12, 12 16 C 16 18, 14 21, 15 22" {...s} strokeWidth={3} />}
      {zone.id === 'mechyr' && (
        <path d="M12 4 C 19 4, 21 9, 21 13 C 21 17, 17 19, 14 19.5 L 13.5 22 H 10.5 L 10 19.5 C 7 19, 3 17, 3 13 C 3 9, 5 4, 12 4Z" {...s} />
      )}
    </svg>
  )
}
