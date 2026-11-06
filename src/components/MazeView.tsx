import { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DIRS, degree, isOpen, neighbor, type Dir, type Maze } from '../game/maze'
import { ZONES, zoneForRow } from '../game/zones'
import { Character, Puddle, type Mood } from './Character'

export interface MazeHandle {
  press: (d: Dir) => void
  release: (d?: Dir) => void
}

interface Props {
  maze: Maze
  activeCheckpoint: number | null
  cleared: number[]
  mood: Mood
  accident: boolean
  /** false během otázky / animací: vstup se ignoruje */
  enabled: boolean
  /** výška průhledného HUDu nad labyrintem, aby kamera centrovala do viditelné části */
  insetTop: number
  onCheckpoint: () => void
  onExit: () => void
  onZone: (zone: number) => void
  onFirstMove: () => void
}

/** buňky za sekundu; panáček běží chodbou až k další křižovatce */
const SPEED = 8.5
const KEYS: Record<string, Dir> = {
  ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'W',
  w: 'N', d: 'E', s: 'S', a: 'W', W: 'N', D: 'E', S: 'S', A: 'W',
}

export const MazeView = forwardRef<MazeHandle, Props>(function MazeView(props, ref) {
  const { maze } = props
  const propsRef = useRef(props)
  propsRef.current = props

  const viewportRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const facingRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ w: 0, h: 0 })
  const [trail, setTrail] = useState<string[]>([])
  const [indicator, setIndicator] = useState<'up' | 'down' | null>(null)

  // ---- rozměry ----------------------------------------------------------
  const P = Math.max(28, Math.min(60, Math.floor((size.w - 20) / maze.w)))
  const TOP = Math.round(P * 0.8)
  const BOTTOM = Math.round(P * 2.1)
  const mazeW = maze.w * P
  const mazeH = TOP + maze.h * P + BOTTOM
  const layout = useRef({ P, TOP, mazeW, mazeH, vw: 0, vh: 0 })
  layout.current = { P, TOP, mazeW, mazeH, vw: size.w, vh: size.h }

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ---- simulace ---------------------------------------------------------
  const sim = useRef({
    cell: maze.start,
    from: maze.start,
    target: -1,
    dir: null as Dir | null,
    fx: maze.start % maze.w,
    fy: Math.floor(maze.start / maze.w),
    buffer: null as Dir | null,
    held: null as Dir | null,
    camY: Number.NaN,
    walking: false,
    facing: 1,
    zone: -1,
    moved: false,
    visited: new Set<string>(),
    indicator: null as 'up' | 'down' | null,
  })

  if (import.meta.env.DEV) (window as unknown as { __sim: unknown }).__sim = sim.current

  const api = useMemo<MazeHandle>(() => {
    const begin = (d: Dir) => {
      const s = sim.current
      if (!isOpen(maze, s.cell, d)) {
        bump()
        return
      }
      s.dir = d
      s.from = s.cell
      s.target = neighbor(maze, s.cell, d)
      if (!s.moved) {
        s.moved = true
        propsRef.current.onFirstMove()
      }
    }
    return {
      press(d) {
        const s = sim.current
        if (!propsRef.current.enabled) return
        s.held = d
        if (s.dir) {
          if (d === DIRS[s.dir].opp) {
            // otočka uprostřed chodby: okamžitě, bez čekání na další buňku
            const t = s.target
            s.target = s.from
            s.from = t
            s.dir = d
            s.buffer = null
          } else {
            s.buffer = d // zahne na nejbližší možné odbočce
          }
          return
        }
        begin(d)
      },
      release(d) {
        const s = sim.current
        if (!d || s.held === d) s.held = null
      },
    }
  }, [maze])

  useImperativeHandle(ref, () => api, [api])

  function bump() {
    // animuj vnitřní SVG, ne obal se scaleX (otočení postavičky)
    const el = facingRef.current?.firstElementChild as SVGElement | null
    if (!el) return
    el.classList.remove('bump')
    void el.getBoundingClientRect()
    el.classList.add('bump')
  }

  useEffect(() => {
    const s = sim.current

    const decide = (cell: number, dir: Dir): Dir | null => {
      const p = propsRef.current
      if (p.activeCheckpoint === cell) {
        s.held = null
        s.buffer = null
        p.onCheckpoint()
        return null
      }
      if (cell === maze.exit) {
        p.onExit()
        return null
      }
      const wanted = s.buffer ?? s.held
      if (wanted && isOpen(maze, cell, wanted)) {
        s.buffer = null
        return wanted
      }
      const deg = degree(maze, cell)
      if (deg === 2) {
        // chodba (i zatáčka): běž dál po "tubulu"
        return (['N', 'E', 'S', 'W'] as Dir[]).find((d) => d !== DIRS[dir].opp && isOpen(maze, cell, d)) ?? null
      }
      s.buffer = null
      return null
    }

    const arrive = () => {
      const a = Math.min(s.from, s.target)
      const b = Math.max(s.from, s.target)
      const key = `${a}-${b}`
      if (!s.visited.has(key)) {
        s.visited.add(key)
        setTrail(Array.from(s.visited))
      }
      s.cell = s.target
      const zone = zoneForRow(Math.floor(s.cell / maze.w), maze.h)
      if (zone !== s.zone) {
        s.zone = zone
        propsRef.current.onZone(zone)
      }
      const next = decide(s.cell, s.dir!)
      s.from = s.cell
      if (next) {
        s.dir = next
        s.target = neighbor(maze, s.cell, next)
      } else {
        s.dir = null
        s.target = -1
      }
    }

    const step = (dt: number) => {
      let budget = SPEED * dt
      while (budget > 0 && s.dir && s.target >= 0) {
        const tx = s.target % maze.w
        const ty = Math.floor(s.target / maze.w)
        const rem = Math.abs(tx - s.fx) + Math.abs(ty - s.fy)
        if (budget < rem) {
          s.fx += DIRS[s.dir].dx * budget
          s.fy += DIRS[s.dir].dy * budget
          budget = 0
        } else {
          budget -= rem
          s.fx = tx
          s.fy = ty
          arrive()
        }
      }
      if (s.dir === 'E') s.facing = 1
      if (s.dir === 'W') s.facing = -1
    }

    const render = (dt: number) => {
      const { P, TOP, mazeW, mazeH, vw, vh } = layout.current
      if (!vw || !playerRef.current || !cameraRef.current) return
      const px = (s.fx + 0.5) * P
      const py = TOP + (s.fy + 0.5) * P
      const pw = P * 0.95
      const ph = (pw * 52) / 40
      playerRef.current.style.transform = `translate3d(${px - pw / 2}px, ${py + P * 0.2 - ph * (50 / 52)}px, 0)`
      if (facingRef.current) facingRef.current.style.transform = `scaleX(${s.facing})`
      const walking = !!s.dir
      if (walking !== s.walking) {
        s.walking = walking
        playerRef.current.classList.toggle('is-walking', walking)
      }

      // kamera: kriticky tlumené sledování, bez překmitu
      const inset = propsRef.current.insetTop
      const visible = vh - inset
      let target: number
      if (mazeH <= visible) target = inset + (visible - mazeH) / 2
      else target = Math.min(inset, Math.max(vh - mazeH, inset + visible / 2 - py))
      if (Number.isNaN(s.camY)) s.camY = target
      else s.camY += (target - s.camY) * (1 - Math.exp(-dt * 7))
      const ox = Math.round((vw - mazeW) / 2)
      cameraRef.current.style.transform = `translate3d(${ox}px, ${s.camY}px, 0)`

      // šipka k další otázce, když je mimo obrazovku
      const cp = propsRef.current.activeCheckpoint
      let ind: 'up' | 'down' | null = null
      if (cp !== null && propsRef.current.enabled) {
        const cy = TOP + (Math.floor(cp / maze.w) + 0.5) * P + s.camY
        if (cy < inset + P * 0.3) ind = 'up'
        else if (cy > vh - P * 0.3) ind = 'down'
      }
      if (ind !== s.indicator) {
        s.indicator = ind
        setIndicator(ind)
      }
    }

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      step(dt)
      render(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [maze])

  // ---- klávesnice (desktop) ---------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const d = KEYS[e.key]
      if (!d || !propsRef.current.enabled) return
      e.preventDefault()
      if (!e.repeat) api.press(d)
    }
    const up = (e: KeyboardEvent) => {
      const d = KEYS[e.key]
      if (d) api.release(d)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [api])

  // ---- swipe / tažení prstem --------------------------------------------
  const swipe = useRef<{ x: number; y: number; dir: Dir | null; id: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    swipe.current = { x: e.clientX, y: e.clientY, dir: null, id: e.pointerId }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const sw = swipe.current
    if (!sw || sw.id !== e.pointerId) return
    const dx = e.clientX - sw.x
    const dy = e.clientY - sw.y
    if (Math.hypot(dx, dy) < 18) return
    const d: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : dy > 0 ? 'S' : 'N'
    sw.x = e.clientX
    sw.y = e.clientY
    if (d !== sw.dir) {
      sw.dir = d
      api.press(d)
    }
  }
  const onPointerEnd = (e: React.PointerEvent) => {
    const sw = swipe.current
    if (!sw || sw.id !== e.pointerId) return
    if (sw.dir) api.release(sw.dir)
    swipe.current = null
  }

  const pw = P * 0.95

  return (
    <div
      ref={viewportRef}
      className="maze-surface absolute inset-0 overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      aria-label="Labyrint. Ovládání šipkami, klávesami WASD nebo tažením prstu."
      role="application"
    >
      {size.w > 0 && (
        <div ref={cameraRef} className="absolute left-0 top-0 overflow-hidden rounded-[24px] will-change-transform" style={{ width: mazeW, height: mazeH }}>
          <MazeArt maze={maze} P={P} TOP={TOP} mazeW={mazeW} mazeH={mazeH} />
          <svg className="absolute inset-0" width={mazeW} height={mazeH} aria-hidden="true">
            <path
              d={trail
                .map((k) => {
                  const [a, b] = k.split('-').map(Number)
                  const [ax, ay] = center(maze, a, P, TOP)
                  const [bx, by] = center(maze, b, P, TOP)
                  return `M${ax} ${ay}L${bx} ${by}`
                })
                .join('')}
              stroke="#F5C431"
              strokeOpacity=".8"
              strokeWidth={P * 0.2}
              strokeLinecap="round"
              fill="none"
            />
            {props.cleared.map((c) => {
              const [x, y] = center(maze, c, P, TOP)
              return (
                <g key={c}>
                  <circle cx={x} cy={y} r={P * 0.15} fill="#23885A" stroke="#FFF7EA" strokeWidth="2" />
                  <path
                    d={`M${x - P * 0.065} ${y} l${P * 0.045} ${P * 0.05} l${P * 0.085} -${P * 0.1}`}
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )
            })}
            {props.activeCheckpoint !== null && <CheckpointMarker maze={maze} cell={props.activeCheckpoint} P={P} TOP={TOP} />}
          </svg>
          <div
            ref={playerRef}
            className="player absolute left-0 top-0 will-change-transform"
            style={{ width: pw, height: (pw * 52) / 40 }}
          >
            <div ref={facingRef} className="h-full w-full">
              <Character mood={props.mood} className="h-full w-full" />
            </div>
            {props.accident && <Puddle />}
          </div>
        </div>
      )}
      {indicator && (
        <div
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/85 px-3.5 py-1.5 text-[13px] font-semibold text-cream shadow-lg backdrop-blur-md"
          style={indicator === 'up' ? { top: props.insetTop + 10 } : { bottom: 12 }}
        >
          {indicator === 'up' ? '↑' : '↓'} Další otázka
        </div>
      )}
    </div>
  )
})

function center(maze: Maze, cell: number, P: number, TOP: number): [number, number] {
  return [((cell % maze.w) + 0.5) * P, TOP + (Math.floor(cell / maze.w) + 0.5) * P]
}

function CheckpointMarker({ maze, cell, P, TOP }: { maze: Maze; cell: number; P: number; TOP: number }) {
  const [x, y] = center(maze, cell, P, TOP)
  return (
    <g>
      <circle className="checkpoint-ring" cx={x} cy={y} r={P * 0.34} fill="none" stroke="#F2A516" strokeWidth="2.5" />
      <circle cx={x} cy={y} r={P * 0.27} fill="#F5C431" stroke="#2A1A16" strokeWidth="2" />
      <text
        x={x}
        y={y + P * 0.11}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize={P * 0.32}
        fill="#2A1A16"
      >
        ?
      </text>
    </g>
  )
}

/** Statická grafika labyrintu: tkáň orgánů jako stěny, chodby jako kanálky (tubuly). */
const MazeArt = memo(function MazeArt({
  maze,
  P,
  TOP,
  mazeW,
  mazeH,
}: {
  maze: Maze
  P: number
  TOP: number
  mazeW: number
  mazeH: number
}) {
  const { bands, rims, floor, exitX, exitY } = useMemo(() => {
    const rimByZone = ZONES.map(() => '')
    let floor = ''
    for (let c = 0; c < maze.w * maze.h; c++) {
      const [x, y] = center(maze, c, P, TOP)
      const z = zoneForRow(Math.floor(c / maze.w), maze.h)
      for (const d of ['E', 'S'] as Dir[]) {
        if (!isOpen(maze, c, d)) continue
        const [nx, ny] = center(maze, neighbor(maze, c, d), P, TOP)
        const seg = `M${x} ${y}L${nx} ${ny}`
        rimByZone[z] += seg
        floor += seg
      }
    }
    const [exitX, exitY] = center(maze, maze.exit, P, TOP)
    const exitSeg = `M${exitX} ${exitY}L${exitX} ${exitY + P * 1.15}`
    rimByZone[ZONES.length - 1] += exitSeg
    floor += exitSeg
    const bands = ZONES.map((zone, z) => {
      let first = -1
      let last = -1
      for (let r = 0; r < maze.h; r++) {
        if (zoneForRow(r, maze.h) === z) {
          if (first < 0) first = r
          last = r
        }
      }
      const y0 = z === 0 ? 0 : TOP + first * P
      const y1 = z === ZONES.length - 1 ? mazeH : TOP + (last + 1) * P
      return { zone, y0, y1 }
    })
    return { bands, rims: rimByZone, floor, exitX, exitY }
  }, [maze, P, TOP, mazeH])

  const [sx, sy] = center(maze, maze.start, P, TOP)
  const label = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: Math.max(11, P * 0.26) }

  return (
    <svg className="absolute inset-0" width={mazeW} height={mazeH} aria-hidden="true">
      <defs>
        <pattern id="tissue" width={P * 0.9} height={P * 0.9} patternUnits="userSpaceOnUse">
          <circle cx={P * 0.22} cy={P * 0.24} r={P * 0.12} fill="none" stroke="#7A2E24" strokeOpacity=".09" strokeWidth="1.5" />
          <circle cx={P * 0.66} cy={P * 0.64} r={P * 0.09} fill="none" stroke="#7A2E24" strokeOpacity=".07" strokeWidth="1.5" />
          <circle cx={P * 0.7} cy={P * 0.2} r={P * 0.035} fill="#fff" fillOpacity=".35" />
        </pattern>
      </defs>
      {bands.map(({ zone, y0, y1 }) => (
        <rect key={zone.id} x="0" y={y0} width={mazeW} height={y1 - y0} fill={zone.tissue} />
      ))}
      <rect width={mazeW} height={mazeH} fill="url(#tissue)" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {rims.map((d, z) => (
          <path key={z} d={d} stroke={ZONES[z].deep} strokeWidth={P * 0.66} />
        ))}
        <path d={floor} stroke="#FFF7EA" strokeWidth={P * 0.5} />
      </g>
      {/* start: Bowmanův váček kolem glomerulu */}
      <circle cx={sx} cy={sy} r={P * 0.44} fill="none" stroke={ZONES[0].deep} strokeWidth="2.5" strokeDasharray="4 4" />
      <path
        d={`M${sx - P * 0.18} ${sy - P * 0.02} q${P * 0.09} -${P * 0.2} ${P * 0.18} 0 t${P * 0.18} 0`}
        stroke="#D9675C"
        strokeOpacity=".55"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <text x={P * 1.02} y={TOP * 0.66} fill="#7A3B30" {...label}>
        Start: glomerulus
      </text>
      {/* cíl: močová trubice → WC */}
      <text x={exitX - P * 0.75} y={exitY + P * 1.42} textAnchor="end" fill="#7A3B4A" {...label}>
        Močová trubice
      </text>
      <g transform={`translate(${exitX - P * 0.42} ${exitY + P * 0.95})`}>
        <rect width={P * 0.84} height={P * 0.92} rx={P * 0.16} fill="#2A1A16" />
        <text
          x={P * 0.42}
          y={P * 0.6}
          textAnchor="middle"
          fill="#FFF7EA"
          fontFamily="var(--font-display)"
          fontWeight="800"
          fontSize={P * 0.34}
        >
          WC
        </text>
      </g>
    </svg>
  )
})
