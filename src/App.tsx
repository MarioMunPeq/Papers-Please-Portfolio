import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DOCUMENTS, INTRO_SCREENS, type PortfolioDoc } from './portfolioData'
import { loadBitmapFont, PixelText } from './bitmapFont.tsx'
import { play, setMuted, startLoop, startMusic, stopLoop, stopMusic, unlockAudio } from './audio'
import './App.css'

const W = 570
const H = 320
const CHECKPOINT_H = 103
const DESK_Y = CHECKPOINT_H
const WALL_W = 178
const PAPER_MAX_W = 260
const PAPER_MAX_H = 200
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

const BUSTS = ['SheetM0p.png', 'SheetM1p.png', 'SheetM2p.png', 'SheetM3p.png', 'SheetM4p.png', 'SheetM5p.png', 'SheetM6p.png']

const BORDER = '/assets-english/border'

/* cola de solicitantes esperando, a la izquierda del checkpoint.
   La dispersion es determinista (hash del indice) para que no se reorden
   en cada render, pero que la masa no parezca una rejilla. */
const QUEUE_BANDS = [
  { y: 26, x0: -8, pitch: 8 },
  { y: 41, x0: -5, pitch: 8 },
  { y: 56, x0: -8, pitch: 8 },
  { y: 71, x0: -10, pitch: 8 },
  { y: 86, x0: -11, pitch: 8 },
]
const QUEUE_PER_BAND = 13

function hash(i: number, salt: number) {
  const s = Math.sin((i + 1) * (salt * 12.9898)) * 43758.5453
  return s - Math.floor(s)
}

const QUEUE = QUEUE_BANDS.flatMap((band, b) =>
  Array.from({ length: QUEUE_PER_BAND }, (_, i) => {
    const index = b * QUEUE_PER_BAND + i
    return {
      x: band.x0 + i * band.pitch + Math.round(hash(index, 1) * 6) - 3,
      y: band.y + Math.round(hash(index, 2) * 6) - 3,
      sprite: Math.floor(hash(index, 3) * 10),
      flip: hash(index, 4) > 0.5,
    }
  })
)

/* guardias apostados a la derecha */
const SOLDIERS = [
  { src: 'navy3', x: 406, y: 20 },
  { src: 'navy5', x: 409, y: 42 },
  { src: 'green7', x: 436, y: 51 },
]

function BorderCast() {
  return (
    <div className="cast" aria-hidden="true">
      {QUEUE.map((person, i) => (
        <img
          key={`q${i}`}
          className="cast-person"
          src={`${BORDER}/black${person.sprite}.png`}
          style={{
            left: person.x,
            top: person.y,
            transform: person.flip ? 'scaleX(-1)' : 'none',
          }}
          alt=""
          draggable={false}
        />
      ))}
      {SOLDIERS.map((soldier, i) => (
        <img
          key={`s${i}`}
          className="cast-person"
          src={`${BORDER}/${soldier.src}.png`}
          style={{ left: soldier.x, top: soldier.y }}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  )
}

function Entrant({ sheet, onDone }: { sheet: string; onDone: () => void }) {
  useEffect(() => {
    const end = window.setTimeout(onDone, 5200)
    return () => window.clearTimeout(end)
  }, [onDone])
  return (
    <div className="entrant">
      <div
        className="entrant-bust"
        style={{ backgroundImage: `url(/assets-english/faces/${sheet})` }}
      />
    </div>
  )
}

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
    <div className="intro" onPointerEnter={unlockAudio} onPointerDown={unlockAudio}>
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
  const [entrant, setEntrant] = useState<string | null>(null)
  const [sirenOn, setSirenOn] = useState(false)
  const [frame, setFrame] = useState({ scale: 1, x: 0, y: 0, vw: 0, vh: 0 })
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


  const fitPaper = useCallback((doc: PortfolioDoc) => {
    const ratio = aspects[doc.id] ?? 0.8
    const natural = doc.native
    const naturalH = natural / ratio
    // 1:1 como en el juego: nunca por encima del tamaño nativo
    const scale = Math.min(1, PAPER_MAX_W / natural, PAPER_MAX_H / naturalH)
    return { width: Math.round(natural * scale), height: Math.round(naturalH * scale) }
  }, [aspects])

  const paperSize = useMemo(
    () => (placed ? fitPaper(placed) : { width: PAPER_MAX_W, height: PAPER_MAX_H }),
    [placed, fitPaper],
  )

  /* convierte coordenadas de pantalla a pixeles locales del documento,
     que es un elemento escalado por el escenario */
  const toPaperSpace = useCallback((clientX: number, clientY: number) => {
    const rect = paperRef.current?.getBoundingClientRect()
    if (!rect) return null
    const kx = paperSize.width ? rect.width / paperSize.width : 1
    const ky = paperSize.height ? rect.height / paperSize.height : 1
    return { x: (clientX - rect.left) / kx, y: (clientY - rect.top) / ky }
  }, [paperSize])

  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / W, window.innerHeight / H)
      setFrame({
        scale: s,
        x: (window.innerWidth - W * s) / 2,
        y: (window.innerHeight - H * s) / 2,
        vw: window.innerWidth,
        vh: window.innerHeight,
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

  /* la tema suena durante toda la intro y se corta al empezar el turno */
  useEffect(() => {
    if (started) { stopMusic(); return }
    startMusic('music.theme', 0.32)
  }, [started, muted])

  useEffect(() => {
    if (!mode) return
    const onMove = (event: PointerEvent) => {
      setCursor({ x: event.clientX, y: event.clientY })
      if (mode.type === 'dragStamp') {
        const local = toPaperSpace(event.clientX, event.clientY)
        if (!local) return
        const sw = paperSize.width * STAMP_RATIO
        setStamps((current) => current.map((stamp) => (
          stamp.id === mode.id
            ? {
              ...stamp,
              x: clamp(local.x - mode.dx, 0, paperSize.width - sw),
              y: clamp(local.y - mode.dy, 0, paperSize.height - 10),
            }
            : stamp
        )))
      }
    }
    const onUp = (event: PointerEvent) => {
      if (mode.type === 'carry') {
        const local = toPaperSpace(event.clientX, event.clientY)
        if (local) {
          const sw = paperSize.width * STAMP_RATIO
          const id = stampId.current++
          setStamps((current) => [
            ...current,
            {
              id,
              kind: mode.kind,
              rot: -12 + Math.round(Math.random() * 18),
              x: clamp(local.x - sw / 2, 0, paperSize.width - sw),
              y: clamp(local.y - 6, 0, paperSize.height - 10),
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
  }, [mode, paperSize, toPaperSpace])

  const placeDocument = useCallback((doc: PortfolioDoc) => {
    const size = fitPaper(doc)
    setPlaced(doc)
    setStamps([])
    setRoster((current) => current.filter((item) => item.id !== doc.id))
    setPosition({
      x: Math.round((W - WALL_W - size.width) / 2),
      y: Math.round((H - DESK_Y - size.height) / 2),
    })
    play('paper', 'drop', { volume: 0.5 })
  }, [fitPaper])

  const callEntrant = useCallback(() => {
    if (entrant) return
    const pick = BUSTS[Math.floor(Math.random() * BUSTS.length)]
    setSirenOn(true)
    play('border', 'foghorn', { volume: 0.5 })
    window.setTimeout(() => {
      setEntrant(pick)
      play('traveler', 'walkin', { volume: 0.45 })
    }, 260)
    window.setTimeout(() => setSirenOn(false), 700)
  }, [entrant])

  const returnDocument = useCallback(() => {
    if (!placed) return
    setRoster((current) => [placed, ...current])
    setPlaced(null)
    setStamps([])
    play('filer', 'open', { volume: 0.4 })
  }, [placed])

  const handlePaperMove = useCallback((event: { clientX: number; clientY: number }) => {
    if (!paperDrag.current || !placed) return
    const rect = deskRef.current?.getBoundingClientRect()
    if (!rect) return
    const areaW = rect.width * ((W - WALL_W) / W)
    const areaH = rect.height * ((H - DESK_Y) / H)
    const areaLeft = rect.left + rect.width * (WALL_W / W)
    const areaTop = rect.top
    const size = fitPaper(placed)
    setPosition({
      x: clamp((event.clientX - areaLeft) / areaW * (W - WALL_W) - paperDrag.current.dx, 0, (W - WALL_W) - size.width),
      y: clamp((event.clientY - areaTop) / areaH * (H - DESK_Y) - paperDrag.current.dy, 0, (H - DESK_Y) - size.height),
    })
  }, [placed, fitPaper])

  const endPaperDrag = useCallback(() => {
    if (!paperDrag.current) return
    paperDrag.current = null
    play('paper', 'release', { volume: 0.4 })
  }, [])

  const handlePaperDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!placed || mode) return
    if (event.button !== 0) return
    event.preventDefault()
    play('paper', 'grab', { volume: 0.4 })
    const rect = deskRef.current?.getBoundingClientRect()
    if (!rect) return
    const area = {
      left: rect.left + rect.width * (WALL_W / W),
      top: rect.top,
      width: rect.width * ((W - WALL_W) / W),
      height: rect.height * ((H - DESK_Y) / H),
    }
    paperDrag.current = {
      dx: (event.clientX - area.left) / area.width * (W - WALL_W) - position.x,
      dy: (event.clientY - area.top) / area.height * (H - DESK_Y) - position.y,
    }
    const move = (native: PointerEvent) => handlePaperMove(native)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      endPaperDrag()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }, [placed, mode, position, handlePaperMove, endPaperDrag])

  const toggleMute = useCallback(() => {
    setMutedState((value) => {
      const next = !value
      setMuted(next)
      // durante la intro solo debe sonar la tema, no el ambiente del escritorio
      if (!next && started) startLoop('ambient.desk', 0.2)
      return next
    })
  }, [started])

  const fieldScale = placed ? (paperSize.width / placed.native) : 1

  if (!started) return <Intro onStart={() => setStarted(true)} />

  return (
    <div
      className="viewport"
      style={{
        ['--split' as string]: `${frame.vh > 0 ? Math.min(100, Math.max(0, (frame.y / frame.vh) * 100)) : 0}%`,
      }}
    >
      <div className="stage" style={{ transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})` }}>

        <div className="outside">
          <img className="checkpoint" src="/assets-english/CheckpointBack.png" alt="" draggable={false} />
          <BorderCast />
          {entrant && <Entrant sheet={entrant} onDone={() => setEntrant(null)} />}
        </div>

        <button
          type="button"
          className={`siren${sirenOn ? ' is-on' : ''}`}
          onClick={callEntrant}
          title="LLAMAR AL SIGUIENTE"
          aria-label="Llamar al siguiente solicitante"
        />

        <div className="desk" ref={deskRef}>
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
                <button type="button" className="stamp-slot denied" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'denied' }) }} disabled={!placed} title="DENEGAR">
                  <img src={STAMP_TOOL.denied} alt="Denegar" draggable={false} />
                </button>
                <button type="button" className="stamp-slot approved" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'approved' }) }} disabled={!placed} title="APROBAR">
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
          </div>

          <button type="button" className="tray-give" onClick={returnDocument} disabled={!placed} title="Entregar">
            <img src="/assets/GiveIcon.png" alt="Entregar" draggable={false} />
          </button>

          {placed && (
            <div
              className="paper"
              ref={paperRef}
              key={placed.id}
              style={{
                width: paperSize.width,
                height: paperSize.height,
                transform: `translate3d(${WALL_W + position.x}px, ${position.y}px, 0)`,
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
                    const local = toPaperSpace(event.clientX, event.clientY)
                    if (!local) return
                    setMode({ type: 'dragStamp', id: stamp.id, dx: local.x - stamp.x, dy: local.y - stamp.y })
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
