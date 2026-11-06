import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useId } from 'react'

interface Props {
  /** 0 = prázdný, 1 = přetéká */
  fill: number
  size?: number
  /** zvýrazní kritický stav (poslední povolená chyba) */
  critical?: boolean
  /** změní se při každé chybě → spustí "zhoupnutí" */
  pulseKey?: number
}

const SAC =
  'M30 6 C47 6 56 17 56 31 C56 44 46 52 37 54.5 L35 61 L25 61 L23 54.5 C14 52 4 44 4 31 C4 17 13 6 30 6 Z'

/** Stylizovaný močový měchýř, který se plní žlutou tekutinou s vlnkou. */
export function Bladder({ fill, size = 44, critical = false, pulseKey = 0 }: Props) {
  const id = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const clamped = Math.max(0, Math.min(1, fill))
  // tekutina mezi y=60 (prázdno) a y=6 (plno)
  const level = 60 - clamped * 54
  const [scope, animate] = useAnimate<SVGSVGElement>()

  // při každé chybě se měchýř "zhoupne" jako balonek s vodou
  useEffect(() => {
    if (!pulseKey || reduce || !scope.current) return
    animate(scope.current, { scaleX: [1.14, 1], scaleY: [0.88, 1] }, { type: 'spring', bounce: 0.55, duration: 0.6 })
  }, [pulseKey, reduce, animate, scope])

  return (
    <svg
      ref={scope}
      width={size}
      height={(size * 64) / 60}
      viewBox="0 0 60 64"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`sac-${id}`}>
          <path d={SAC} />
        </clipPath>
      </defs>
      {/* močovody přicházející shora */}
      <path d="M15 12 Q11 7 12 3" stroke="#D98680" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M45 12 Q49 7 48 3" stroke="#D98680" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={SAC} fill="#FFF4EC" />
      <g clipPath={`url(#sac-${id})`}>
        <motion.g
          initial={false}
          animate={{ y: level }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.8 }}
        >
          <g className={reduce ? '' : 'liquid-wave'}>
            <path
              d="M-60 0 q7.5 -4 15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 V70 H-60Z"
              fill={critical ? '#F2A516' : '#F5C431'}
            />
          </g>
          <rect x="10" y="5" width="9" height="40" rx="4.5" fill="#FFF0B8" opacity=".45" />
        </motion.g>
      </g>
      <path
        d={SAC}
        fill="none"
        stroke={critical ? '#C93C3C' : '#C8737F'}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* lesk */}
      <path d="M14 22 Q16 14 24 11" stroke="#fff" strokeOpacity=".8" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
