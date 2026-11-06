import { motion } from 'motion/react'

export type Mood = 'idle' | 'happy' | 'worried' | 'desperate' | 'ashamed'

const INK = '#2A1A16'
const SKIN = '#FFE0C2'
const SHIRT = '#1E6B73'

interface Props {
  mood: Mood
  className?: string
}

/**
 * Panáček. Nohy a tělo animuje CSS (třídy .is-walking / .mood-*),
 * výraz obličeje se mění podle naplnění měchýře.
 */
export function Character({ mood, className = '' }: Props) {
  const crossed = mood === 'desperate' || mood === 'ashamed'
  return (
    <svg
      viewBox="0 0 40 52"
      className={`character mood-${mood} ${className}`}
      aria-hidden="true"
      overflow="visible"
    >
      <ellipse cx="20" cy="50" rx="10" ry="2.4" fill="rgba(42,26,22,.16)" />
      <g className="char-root">
        <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none">
          {crossed ? (
            <>
              <path className="leg leg-l" d="M16.5 37 L23.5 48" />
              <path className="leg leg-r" d="M23.5 37 L16.5 48" />
            </>
          ) : (
            <>
              <path className="leg leg-l" d="M17 37 L15.6 48" />
              <path className="leg leg-r" d="M23 37 L24.4 48" />
            </>
          )}
        </g>
        <g className="char-upper">
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
            {mood === 'happy' ? (
              <>
                <path d="M13 27.5 Q8.5 23 7.5 18.5" />
                <path d="M27 27.5 Q31.5 23 32.5 18.5" />
              </>
            ) : crossed ? (
              <>
                <path d="M13 28 Q14.5 34.5 18.6 36" />
                <path d="M27 28 Q25.5 34.5 21.4 36" />
              </>
            ) : (
              <>
                <path className="arm arm-l" d="M12.8 28 Q8.6 31 8.8 35.5" />
                <path className="arm arm-r" d="M27.2 28 Q31.4 31 31.2 35.5" />
              </>
            )}
          </g>
          <rect x="12" y="24" width="16" height="15" rx="7" fill={SHIRT} stroke={INK} strokeWidth="2" />
          <path d="M16 25.5 q4 3 8 0" stroke="#FFF6E6" strokeOpacity=".55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="14" r="10.5" fill={SKIN} stroke={INK} strokeWidth="2" />
          <path d="M18.6 3.9 q1.8 -3.2 4.6 -1.6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
          <Face mood={mood} />
        </g>
        {(mood === 'worried' || mood === 'desperate') && (
          <path
            className="sweat"
            d="M31.5 4.5 q2.6 3.6 0 5.4 q-2.6 -1.8 0 -5.4z"
            fill="#8FD0E8"
            stroke={INK}
            strokeWidth="1"
          />
        )}
      </g>
    </svg>
  )
}

function Face({ mood }: { mood: Mood }) {
  const stroke = { stroke: INK, strokeWidth: 1.9, strokeLinecap: 'round' as const, fill: 'none' }
  switch (mood) {
    case 'happy':
      return (
        <>
          <path d="M14.8 14.6 q1.5 -2.2 3 0" {...stroke} />
          <path d="M22.2 14.6 q1.5 -2.2 3 0" {...stroke} />
          <path d="M16.4 17.6 q3.6 5.4 7.2 0z" fill={INK} />
          <ellipse cx="14.6" cy="17.4" rx="1.8" ry="1.1" fill="#F49A8E" opacity=".7" />
          <ellipse cx="25.4" cy="17.4" rx="1.8" ry="1.1" fill="#F49A8E" opacity=".7" />
        </>
      )
    case 'worried':
      return (
        <>
          <path d="M14.4 11.4 L17.8 10.2" {...stroke} />
          <path d="M25.6 11.4 L22.2 10.2" {...stroke} />
          <circle cx="16.3" cy="14.4" r="1.45" fill={INK} />
          <circle cx="23.7" cy="14.4" r="1.45" fill={INK} />
          <path d="M16.6 19.6 q1 -1.1 2.1 0 q1 1.1 2.1 0 q1 -1.1 2.1 0" {...stroke} />
        </>
      )
    case 'desperate':
      return (
        <>
          <path d="M15 12.4 l2.7 1.7 l-2.7 1.7" {...stroke} />
          <path d="M25 12.4 l-2.7 1.7 l2.7 1.7" {...stroke} />
          <rect x="16.3" y="17.6" width="7.4" height="3.4" rx="1.3" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <path d="M20 17.8 v3" stroke={INK} strokeWidth="1.1" />
          <ellipse cx="14.4" cy="17.6" rx="1.7" ry="1" fill="#F07A7A" opacity=".6" />
          <ellipse cx="25.6" cy="17.6" rx="1.7" ry="1" fill="#F07A7A" opacity=".6" />
        </>
      )
    case 'ashamed':
      return (
        <>
          <path d="M14.8 13.8 q1.5 1.7 3 0" {...stroke} />
          <path d="M22.2 13.8 q1.5 1.7 3 0" {...stroke} />
          <path d="M18.3 19.6 q1.7 -1.2 3.4 0" {...stroke} />
          <ellipse cx="14.4" cy="17" rx="2.4" ry="1.4" fill="#F07A7A" opacity=".75" />
          <ellipse cx="25.6" cy="17" rx="2.4" ry="1.4" fill="#F07A7A" opacity=".75" />
        </>
      )
    default:
      return (
        <>
          <circle cx="16.3" cy="14" r="1.45" fill={INK} />
          <circle cx="23.7" cy="14" r="1.45" fill={INK} />
          <path d="M17.4 18.4 q2.6 2.2 5.2 0" {...stroke} />
        </>
      )
  }
}

/**
 * Komiksová nehoda: louže pod nohama + pár kapek. Žádný realismus,
 * jen žlutá kreslená kaluž, která se rozteče.
 */
export function Puddle() {
  const drops = [
    { x: -26, y: -30, d: 0.05 },
    { x: 22, y: -36, d: 0.12 },
    { x: -12, y: -44, d: 0.2 },
    { x: 30, y: -18, d: 0.28 },
    { x: -32, y: -12, d: 0.34 },
  ]
  return (
    <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 -translate-y-[40%]">
      <motion.svg
        width="96"
        height="34"
        viewBox="0 0 96 34"
        className="block"
        initial={{ scaleX: 0.1, scaleY: 0.2, opacity: 0 }}
        animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.25 }}
        style={{ originY: 0.5 }}
      >
        <path
          d="M10 18 C4 10 22 4 34 7 C44 2 64 3 72 8 C88 6 96 16 86 22 C92 30 66 33 52 29 C40 34 16 32 14 26 C4 26 4 21 10 18Z"
          fill="#F5C431"
          stroke="#C99A12"
          strokeWidth="2"
        />
        <ellipse cx="38" cy="13" rx="12" ry="3" fill="#FFF0B8" opacity=".75" />
        <ellipse cx="66" cy="19" rx="5" ry="1.6" fill="#FFF0B8" opacity=".6" />
      </motion.svg>
      {drops.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 block h-2.5 w-2 rounded-full bg-[#F5C431] ring-1 ring-[#C99A12]"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
          animate={{ x: [0, p.x * 0.6, p.x], y: [0, p.y, 6], opacity: [0, 1, 0], scale: [0.6, 1, 0.8] }}
          transition={{ duration: 0.85, delay: 0.2 + p.d, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
