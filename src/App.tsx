import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DOCUMENTS, INTRO_SCREENS, type PortfolioDoc } from './portfolioData'
import { loadBitmapFont, PixelText } from './bitmapFont.tsx'
import { play, setMuted, startLoop, stopLoop, unlockAudio } from './audio'
import './App.css'

const W = 570
const H = 320
const CHECKPOINT_H = 103
const DESK_Y = CHECKPOINT_H
const WALL_W = 178
const PAPER_MAX_W = 150
const PAPER_MAX_H = 165
const STAMP_RATIO = 0.62

type StampKind = 'approved' | 'denied'

interface PlacedStamp {
  id: number
  kind: StampKind
  rot: number
  x: number
  y: number
  fresh: boolean
}

type Mode =
  | { type: 'carry'; kind: StampKind }
  | { type: 'dragStamp'; id: number; dx: number; dy: number }
  | null

const INK: Record<StampKind, string> = {
  approved: '/assets-english/InkApproved.png',
  denied: '/assets-english/InkDenied.png',
}

const STAMP_TOOL: Record<StampKind, string> = {
  approved: '/assets-english/StampBotApproved.png',
  denied: '/assets-english/StampBotDenied.png',
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/* sprite sheet: sheet, frame count, frame width, frame height, row, duration */

function Intro({ onStart }: { onStart: () => void }) {
  const [index, setIndex] = useState(0)
  const screen = INTRO_SCREENS[index]
  const isLast = index === INTRO_SCREENS.length - 1

  useEffect(() => {
    if (index === 0) {
      play('intro', 'shutter', { volume: 0.45 })
      play('intro', 'start', { volume: 0.4 })
    }
  }, [index])

  return (
    <div className="intro" onPointerEnter={unlockAudio}>
      <div className="intro-screen" key={index}>
        <img className="intro-art" src={screen.image} alt={screen.alt} />
        {screen.lines.length > 0 && (
          <div className="intro-copy">
            {screen.lines.map((line) => <p key={line}>{line}</p>)}
          </div>
        )}
      </div>
      <button
        type="button"
        className="intro-cta"
        onClick={() => {
          play('button', 'down', { volume: 0.4 })
          if (isLast) onStart()
          else setIndex((value) => value + 1)
        }}
      >
        {screen.cta}
      </button>
    </div>
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [shutter, setShutter] = useState(true)
  const [frame, setFrame] = useState({ scale: 1, x: 0, y: 0 })
  const [roster, setRoster] = useState<PortfolioDoc[]>(DOCUMENTS)
  const [placed, setPlaced] = useState<PortfolioDoc | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [stamps, setStamps] = useState<PlacedStamp[]>([])
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [mode, setMode] = useState<Mode>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [muted, setMutedState] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const paperDrag = useRef<{ dx: number; dy: number } | null>(null)
  const stampId = useRef(0)

  useEffect(() => { loadBitmapFont('/assets-english/fonts/atarismall_u_regular_8.png') }, [])

  useEffect(() => {
    const fit = () => {
      const rawX = window.innerWidth / W
      const rawY = window.innerHeight / H
      const fitScale = Math.min(rawX, rawY)
      const integer = Math.floor(fitScale)
      const scale = integer >= 1 ? integer : fitScale
      setFrame({
        scale,
        x: Math.round((window.innerWidth - W * scale) / 2),
        y: Math.round((window.innerHeight - H * scale) / 2),
      })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    let cancelled = false
    DOCUMENTS.forEach((doc) => {
      const image = new Image()
      image.onload = () => {
        if (!cancelled) {
          setAspects((current) => ({ ...current, [doc.id]: image.naturalWidth / image.naturalHeight }))
        }
      }
      image.src = doc.image
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const block = (event: Event) => event.preventDefault()
    document.addEventListener('dragstart', block)
    return () => document.removeEventListener('dragstart', block)
  }, [])

  useEffect(() => {
    if (!started) { stopLoop(); return }
    unlockAudio()
    play('intro', 'curtain', { volume: 0.5 })
    play('intro', 'shutter', { volume: 0.5 })
    startLoop('ambient.desk', 0.2)
    const id = window.setTimeout(() => setShutter(false), 700)
    return () => { window.clearTimeout(id); stopLoop() }
  }, [started])

  useEffect(() => {
    if (!mode) return
    const onMove = (event: PointerEvent) => {
      setCursor({ x: event.clientX, y: event.clientY })
      if (mode.type === 'dragStamp') {
        const rect = paperRef.current?.getBoundingClientRect()
        if (!rect) return
        const sw = rect.width * STAMP_RATIO
        setStamps((current) => current.map((stamp) => (
          stamp.id === mode.id
            ? {
              ...stamp,
              x: clamp(event.clientX - rect.left - mode.dx, 0, rect.width - sw),
              y: clamp(event.clientY - rect.top - mode.dy, 0, rect.height - 10),
            }
            : stamp
        )))
      }
    }
    const onUp = (event: PointerEvent) => {
      if (mode.type === 'carry') {
        const rect = paperRef.current?.getBoundingClientRect()
        if (rect) {
          const sw = rect.width * STAMP_RATIO
          const id = stampId.current++
          setStamps((current) => [
            ...current,
            {
              id,
              kind: mode.kind,
              rot: -12 + Math.round(Math.random() * 18),
              x: clamp(event.clientX - rect.left - sw / 2, 0, rect.width - sw),
              y: clamp(event.clientY - rect.top - 6, 0, rect.height - 10),
              fresh: true,
            },
          ])
          play('stamp', 'down', { volume: 0.55 })
        }
      }
      setMode(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [mode])

  const fitPaper = useCallback((doc: PortfolioDoc) => {
    const ratio = aspects[doc.id] ?? 0.8
    const natural = doc.native
    const naturalH = natural / ratio
    const scale = Math.min(PAPER_MAX_W / natural, PAPER_MAX_H / naturalH)
    return { width: Math.round(natural * scale), height: Math.round(naturalH * scale) }
  }, [aspects])

  const placeDocument = useCallback((doc: PortfolioDoc) => {
    const size = fitPaper(doc)
    setPlaced(doc)
    setStamps([])
    setRoster((current) => current.filter((item) => item.id !== doc.id))
    setPosition({ x: 330 - size.width / 2, y: 235 - size.height / 2 })
    play('paper', 'drop', { volume: 0.5 })
  }, [fitPaper])

  const returnDocument = useCallback(() => {
    if (!placed) return
    setRoster((current) => [placed, ...current])
    setPlaced(null)
    setStamps([])
    play('filer', 'open', { volume: 0.4 })
  }, [placed])

  const handlePaperDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!placed || mode) return
    if (event.button !== 0) return
    event.preventDefault()
    play('paper', 'grab', { volume: 0.4 })
    const rect = paperRef.current?.getBoundingClientRect()
    if (!rect) return
    paperDrag.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    }
  }, [placed, mode])

  const handlePaperMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!paperDrag.current || !placed) return
    const rect = deskRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = rect.width / (W - WALL_W)
    const sy = rect.height / (H - DESK_Y)
    const size = fitPaper(placed)
    setPosition({
      x: clamp((event.clientX - rect.left) / sx - paperDrag.current.dx, 0, (W - WALL_W) - size.width),
      y: clamp((event.clientY - rect.top) / sy - paperDrag.current.dy, 0, (H - DESK_Y) - size.height),
    })
  }, [placed, fitPaper])

  const endPaperDrag = useCallback(() => {
    if (!paperDrag.current) return
    paperDrag.current = null
    play('paper', 'release', { volume: 0.4 })
  }, [])

  const toggleMute = useCallback(() => {
    setMutedState((value) => {
      const next = !value
      setMuted(next)
      if (!next) startLoop('ambient.desk', 0.2)
      return next
    })
  }, [])

  const paperSize = useMemo(() => (placed ? fitPaper(placed) : { width: PAPER_MAX_W, height: PAPER_MAX_H }), [placed, fitPaper])
  const fieldScale = placed ? (paperSize.width / placed.native) : 1

  if (!started) return <Intro onStart={() => setStarted(true)} />

  return (
    <div className="viewport">
      <div className="bleed" />
      <div className="stage" style={{ transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})` }}>

        <div className="outside">
          <img className="checkpoint" src="/assets-english/CheckpointBack.png" alt="" draggable={false} />
        </div>

        <div className="desk" ref={deskRef} onPointerMove={handlePaperMove} onPointerUp={endPaperDrag}>
          <img className="desk-sprite" src="/assets-english/Desk.png" alt="" draggable={false} />

          <div className="wall">
            <img className="wall-sprite" src="/assets-english/BoothWall.png" alt="" draggable={false} />
            <img className="mugshot" src="/assets/avatar.png" alt="Retrato" draggable={false} />
          </div>

          <div className="console">
            <PixelText className="console-date" text="25.11.82" x={4} y={118} color="#d8d2b4" />
            <PixelText className="console-weight" text="87 KG" x={WALL_W - 4} y={118} color="#d8d2b4" align="right" />
          </div>

          <div className="stampbar">
            <img className="stampbar-frame" src="/assets-english/StampBarTop.png" alt="" draggable={false} />
            <div className="stampbar-slots">
              <button type="button" className="stamp-slot" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'denied' }) }} disabled={!placed} title="DENEGAR">
                <img src={STAMP_TOOL.denied} alt="Denegar" draggable={false} />
              </button>
              <button type="button" className="stamp-slot" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'approved' }) }} disabled={!placed} title="APROBAR">
                <img src={STAMP_TOOL.approved} alt="Aprobar" draggable={false} />
              </button>
            </div>
            <img className="stampbar-mid" src="/assets-english/StampBarMid.png" alt="" draggable={false} />
            <img className="stampbar-bot" src="/assets-english/StampBarBot.png" alt="" draggable={false} />
          </div>

          <div className="tray">
            {roster.map((doc, index) => (
              <button
                type="button"
                key={doc.id}
                className="tray-doc"
                style={{ left: `${5 + index * 23}px` }}
                onClick={() => placeDocument(doc)}
                onPointerDown={() => play('inspect', 'highlight', { volume: 0.3 })}
                title={doc.title}
                aria-label={`Inspeccionar ${doc.title}`}
              >
                <img src={doc.image} alt="" draggable={false} />
              </button>
            ))}
            <button type="button" className="tray-give" onClick={returnDocument} disabled={!placed} title="Entregar">
              <img src="/assets/GiveIcon.png" alt="Entregar" draggable={false} />
            </button>
          </div>

          {placed && (
            <div
              className="paper"
              ref={paperRef}
              key={placed.id}
              style={{
                width: paperSize.width,
                height: paperSize.height,
                transform: `translate3d(${WALL_W + position.x}px, ${DESK_Y + position.y}px, 0)`,
              }}
              onPointerDown={handlePaperDown}
              role="group"
              aria-label={placed.title}
            >
              <img className="paper-sheet" src={placed.image} alt={placed.title} draggable={false} />
              {placed.photo && (
                <span
                  className="doc-photo"
                  style={{
                    left: `${placed.photo.x}%`,
                    top: `${placed.photo.y}%`,
                    width: `${placed.photo.w}%`,
                    height: `${placed.photo.h}%`,
                    background: placed.photo.tint,
                    mixBlendMode: 'multiply',
                  }}
                  aria-hidden="true"
                >
                  <img src="/assets/avatar.png" alt="" draggable={false} />
                </span>
              )}
              {placed.fields.map((field, index) => (
                <span
                  key={index}
                  className={field.panel ? 'field panel' : 'field'}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    width: field.w ? `${field.w}%` : undefined,
                    height: field.h ? `${field.h}%` : undefined,
                    fontSize: field.size ? `${field.size * fieldScale * 1.6}px` : undefined,
                    textAlign: field.align,
                    fontWeight: field.bold ? 700 : 400,
                    color: field.color,
                    background: field.bg,
                  }}
                  aria-hidden="true"
                >
                  {field.t}
                </span>
              ))}
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className={`ink${stamp.fresh ? ' fresh' : ''}`}
                  style={{ left: `${stamp.x}px`, top: `${stamp.y}px`, width: `${STAMP_RATIO * 100}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    const rect = paperRef.current?.getBoundingClientRect()
                    if (!rect) return
                    setMode({ type: 'dragStamp', id: stamp.id, dx: event.clientX - rect.left - stamp.x, dy: event.clientY - rect.top - stamp.y })
                  }}
                >
                  <img src={INK[stamp.kind]} alt="" draggable={false} style={{ transform: `rotate(${stamp.rot}deg)` }} />
                </div>
              ))}
            </div>
          )}

          {shutter && (
            <img
              className="shutter-sprite"
              src="/assets-english/Shutter.png"
              alt=""
              draggable={false}
              onAnimationEnd={() => setShutter(false)}
            />
          )}

          <button type="button" className="sound" onClick={toggleMute} title="Sonido (M)">
            {muted ? 'MUTE' : 'SND'}
          </button>
        </div>

        <PixelText className="hint" text={placed ? '' : 'ARRASTRE DOCUMENTOS AQUI'} x={420} y={302} color="#4c5251" align="center" />
      </div>

      {mode?.type === 'carry' && (
        <img
          className="carried"
          src={INK[mode.kind]}
          alt=""
          style={{ left: cursor.x, top: cursor.y }}
          draggable={false}
        />
      )}
    </div>
  )
}

export default App
