import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DOCUMENTS, DOC_ASPECT, INTRO_SCREENS, type PortfolioDoc } from './portfolioData'
import { cargaGithub, ctxIntro, fechaDeUrl, rellena, type Github } from './introData'
import { loadBitmapFont, PixelText } from './bitmapFont.tsx'
import { PanelProyectos } from './Proyectos'
import { asset, en, BORDER_BASE as BORDER, BITMAP_FONT } from './paths'
import { play, setMuted, startLoop, startMusic, stopLoop, stopMusic, unlockAudio } from './audio'
import './App.css'

const W = 570
const H = 320
const CHECKPOINT_H = 103
const DESK_Y = CHECKPOINT_H
const WALL_W = 178
const PAPER_MAX_W = 240
const PAPER_MAX_H = 124
const STAMP_RATIO = 0.34

/* la pila de documentos de la izquierda. La franja verde del escritorio va
   de stage y 210 a 268, o sea del 107 al 165 en coordenadas del escritorio.
   Los papeles se solapan a proposito: eso permite que quepan grandes.
   Los huecos van intercalados por filas para que al quitar uno los demas
   no se recoloquen. */
const MESA = { x: 0, y: 107, w: 178, h: 58 }
const MESA_PAPER = { w: 42, h: 32 }
const MESA_SLOTS = [
  { x: 0, y: 1, rot: -5 },
  { x: 88, y: 3, rot: 4 },
  { x: 0, y: 26, rot: 6 },
  { x: 88, y: 28, rot: -6 },
  { x: 44, y: 1, rot: -3 },
  { x: 132, y: 4, rot: 7 },
  { x: 44, y: 26, rot: 2 },
  { x: 132, y: 28, rot: -4 },
]

/* si se suelta un papel cerca de la franja, se encaja dentro de ella;
   si se suelta lejos, devuelve null y vuelve a su hueco de origen */
function snapToBand(x: number, y: number) {
  const centreY = y + MESA_PAPER.h / 2
  if (centreY < MESA.y - 26 || centreY > MESA.y + MESA.h + 26) return null
  return {
    x: clamp(x, 0, W - MESA.x - MESA_PAPER.w),
    y: clamp(y, MESA.y, MESA.y + MESA.h - MESA_PAPER.h),
  }
}

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
  | null

const INK: Record<StampKind, string> = {
  approved: en('InkApproved.png'),
  denied: en('InkDenied.png'),
}

const STAMP_TOOL: Record<StampKind, string> = {
  approved: en('StampBotApproved.png'),
  denied: en('StampBotDenied.png'),
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)


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

function Intro({ onStart }: { onStart: () => void }) {
  const [index, setIndex] = useState(0)
  const [github, setGithub] = useState<Github | null>(null)
  const ctx = useMemo(() => ctxIntro(fechaDeUrl()), [])
  const screen = INTRO_SCREENS[index]
  const isLast = index === INTRO_SCREENS.length - 1

  useEffect(() => {
    let vivo = true
    cargaGithub().then((datos) => { if (vivo) setGithub(datos) })
    return () => { vivo = false }
  }, [])

  useEffect(() => {
    if (index === 0) {
      play('intro', 'shutter', { volume: 0.45 })
      play('intro', 'start', { volume: 0.4 })
    }
  }, [index])

  const lineas = [
    ...screen.lines,
    ...(ctx.festivo && screen.festivo ? screen.festivo : []),
  ]

  return (
    <div className="intro" onPointerEnter={unlockAudio} onPointerDown={unlockAudio}>
      <div className="intro-screen" key={index}>
        <img className="intro-art" src={screen.image} alt={rellena(screen.alt, ctx, github)} />
        {lineas.length > 0 && (
          <div className="intro-copy">
            {screen.lines.map((line) => <p key={line}>{rellena(line, ctx, github)}</p>)}
            {ctx.festivo && screen.festivo?.map((line) => (
              <p key={line} className="intro-festivo">{rellena(line, ctx, github)}</p>
            ))}
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

/* medida de un papel a 1:1 como maximo, igual que fitPaper pero sin depender
   de los aspectos cargados (solo para la hoja de maquetado) */
function fitDocSize(doc: PortfolioDoc) {
  const ratio = DOC_ASPECT[doc.id] ?? 0.8
  const naturalH = doc.native / ratio
  const scale = Math.min(1, PAPER_MAX_W / doc.native, PAPER_MAX_H / naturalH)
  return { width: Math.round(doc.native * scale), height: Math.round(naturalH * scale) }
}

function DocSheet() {
  const ZOOM = 2.2
  return (
    <div className="docsheet">
      {DOCUMENTS.map((doc) => {
        const base = fitDocSize(doc)
        const size = { width: Math.round(base.width * ZOOM), height: Math.round(base.height * ZOOM) }
        const fieldScale = size.width / doc.native
        return (
          <div className="docsheet-cell" key={doc.id}>
            <div className="docsheet-label">{doc.id}</div>
            <div className="docsheet-doc" style={{ width: size.width, height: size.height }}>
              <img className="paper-sheet" src={doc.image} alt="" draggable={false} />
              {doc.photo && (
                <span
                  className="doc-photo"
                  style={{
                    left: `${doc.photo.x}%`,
                    top: `${doc.photo.y}%`,
                    width: `${doc.photo.w}%`,
                    height: `${doc.photo.h}%`,
                    background: doc.photo.tint,
                    mixBlendMode: doc.photo.blend as React.CSSProperties['mixBlendMode'],
                  }}
                >
                  <img src={asset('avatar.png')} alt="" draggable={false} />
                </span>
              )}
              {doc.fields.map((field, i) => (
                <span
                  key={i}
                  className="field"
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
                >
                  {field.t}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [shutter, setShutter] = useState(true)
  const [frame, setFrame] = useState({ scale: 1, x: 0, y: 0, vw: 0, vh: 0, aplanar: true })
  const [jugandoEnVertical, setJugandoEnVertical] = useState(false)
  const [verProyectos, setVerProyectos] = useState(false)
  const [roster, setRoster] = useState<PortfolioDoc[]>(DOCUMENTS)
  const [placed, setPlaced] = useState<PortfolioDoc | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [mesaPos, setMesaPos] = useState<Record<string, { x: number; y: number }>>({})
  const [zOrder, setZOrder] = useState<Record<string, number>>({})
  const [stamps, setStamps] = useState<PlacedStamp[]>([])
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [mode, setMode] = useState<Mode>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [muted, setMutedState] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const paperDrag = useRef<{ dx: number; dy: number } | null>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const mesaDrag = useRef<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null)
  const zCounter = useRef(0)
  const stampId = useRef(0)

  useEffect(() => { loadBitmapFont(BITMAP_FONT) }, [])

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
        // el fondo con degradado solo aguanta si sobra poca altura. da igual
        // que mande el ancho o el alto: lo que decide es cuanto hueco queda
        // arriba y abajo, que en vertical y en tablet apaisada es mucho.
        aplanar: (H * s) / window.innerHeight < 0.8,
      })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    if (!verProyectos) return
    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVerProyectos(false)
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [verProyectos])

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

  /* cada documento tiene su hueco fijo en la mesa, con algo de desajuste
     para que la pila parezca dejada a mano y no muy automatica */
  const slotOf = useCallback((doc: PortfolioDoc) => {
    const i = Math.max(0, DOCUMENTS.findIndex((item) => item.id === doc.id))
    const base = MESA_SLOTS[i % MESA_SLOTS.length]
    return {
      x: base.x + Math.round(hash(i, 1) * 5) - 2,
      y: base.y + Math.round(hash(i, 2) * 2) - 1,
      rot: base.rot,
    }
  }, [])

  /* saca un papel de la mesa arrastrandolo: se pega al cursor por el punto
     donde se ha cogido y, al soltar, se queda donde se ha dejado (dentro de
     la franja) o pasa a la zona de inspeccion si cae a la derecha */
  const startMesaDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>, doc: PortfolioDoc) => {
    if (event.button !== 0 || mode) return
    event.preventDefault()
    const rect = deskRef.current?.getBoundingClientRect()
    if (!rect) return
    const toDesk = (cx: number, cy: number) => ({
      x: (cx - rect.left) * (W / rect.width),
      y: (cy - rect.top) * ((H - DESK_Y) / rect.height),
    })
    // el arrastre trabaja en coordenadas del escritorio, no de la mesa
    const slot = slotOf(doc)
    const live = mesaPos[doc.id] ?? { x: MESA.x + slot.x, y: MESA.y + slot.y }
    const p = toDesk(event.clientX, event.clientY)

    setZOrder((current) => ({ ...current, [doc.id]: (zCounter.current += 1) }))
    setMesaPos((current) => ({ ...current, [doc.id]: live }))
    mesaDrag.current = { id: doc.id, dx: p.x - live.x, dy: p.y - live.y, x: live.x, y: live.y }
    play('paper', 'grab', { volume: 0.4 })

    const move = (native: PointerEvent) => {
      const drag = mesaDrag.current
      if (!drag) return
      const q = toDesk(native.clientX, native.clientY)
      drag.x = clamp(q.x - drag.dx, 0, W - MESA_PAPER.w)
      drag.y = clamp(q.y - drag.dy, 0, (H - DESK_Y) - MESA_PAPER.h)
      setMesaPos((current) => ({ ...current, [drag.id]: { x: drag.x, y: drag.y } }))
    }
    const drop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', drop)
      window.removeEventListener('pointercancel', drop)
      const drag = mesaDrag.current
      mesaDrag.current = null
      if (!drag) return

      if (drag.x > WALL_W) {
        // a la derecha: pasa a ser el documento de trabajo
        setMesaPos((current) => {
          const next = { ...current }
          delete next[drag.id]
          return next
        })
        setRoster((current) => current.filter((item) => item.id !== doc.id))
        setPlaced(doc)
        setStamps([])
        setPosition({ x: Math.round(drag.x - WALL_W), y: Math.round(drag.y) })
        play('paper', 'drop', { volume: 0.5 })
        return
      }
      // si se ha soltado cerca de la franja se queda, encajado dentro de ella
      const snapped = snapToBand(drag.x, drag.y)
      if (snapped) {
        setMesaPos((current) => ({ ...current, [drag.id]: snapped }))
        play('paper', 'drop', { volume: 0.5 })
        return
      }
      setMesaPos((current) => {
        const next = { ...current }
        delete next[drag.id]
        return next
      })
      play('paper', 'release', { volume: 0.4 })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', drop)
    window.addEventListener('pointercancel', drop)
  }, [mode, mesaPos, slotOf])

  /* la bocina solo avisa: suena el anuncio y no cambia nada en pantalla */
  const callEntrant = useCallback(() => {
    play('speech', 'announce', { volume: 0.55 })
  }, [])

  const returnDocument = useCallback((at?: { x: number; y: number }) => {
    if (!placed) return
    // siempre vuelve a la pila; `at` solo decide en que hueco se queda
    setRoster((current) => [placed, ...current])
    setPlaced(null)
    setStamps([])
    if (at) {
      const snapped = snapToBand(at.x, at.y)
      if (snapped) {
        setMesaPos((current) => ({ ...current, [placed.id]: snapped }))
        play('paper', 'drop', { volume: 0.45 })
        return
      }
    }
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
    // se puede arrastrar hasta encima de la mesa de la izquierda
    const next = {
      x: clamp((event.clientX - areaLeft) / areaW * (W - WALL_W) - paperDrag.current.dx, -WALL_W, (W - WALL_W) - size.width),
      y: clamp((event.clientY - areaTop) / areaH * (H - DESK_Y) - paperDrag.current.dy, 0, (H - DESK_Y) - size.height),
    }
    positionRef.current = next
    setPosition(next)
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
    const size = fitPaper(placed)
    const move = (native: PointerEvent) => handlePaperMove(native)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      endPaperDrag()
      // soltado encima de la mesa de la izquierda vuelve a la pila
      if (placed && positionRef.current.x + size.width / 2 < 0) {
        returnDocument({ x: WALL_W + positionRef.current.x, y: positionRef.current.y })
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }, [placed, mode, position, handlePaperMove, endPaperDrag, fitPaper, returnDocument])

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

  if (new URLSearchParams(window.location.search).has('sheet')) return <DocSheet />

  if (!started) return <Intro onStart={() => setStarted(true)} />

  return (
    <div
      className="viewport"
      data-plano={frame.aplanar ? 'si' : 'no'}
      style={{
        ['--split' as string]: `${frame.vh > 0 ? Math.min(100, Math.max(0, (frame.y / frame.vh) * 100)) : 0}%`,
      }}
    >
      <div className="stage" style={{ transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})` }}>

        <div className="outside">
          <img className="checkpoint" src={en('CheckpointBack.png')} alt="" draggable={false} />
          <BorderCast />
        </div>

        <button
          type="button"
          className="siren"
          onClick={callEntrant}
          title="LLAMAR AL SIGUIENTE"
          aria-label="Llamar al siguiente solicitante"
        >
          <span className="siren-off" />
          <span className="siren-on" />
        </button>

        <div className="desk" ref={deskRef}>
          <img className="desk-sprite" src={en('Desk.png')} alt="" draggable={false} />

          <div className="wall">
            <img className="wall-sprite" src={en('BoothWall.png')} alt="" draggable={false} />
            <img className="mugshot" src={asset('avatar.png')} alt="Retrato" draggable={false} />
          </div>

          <div className="console">
            <PixelText className="console-date" text="25.11.82" x={4} y={118} color="#d8d2b4" />
            <PixelText className="console-weight" text="87 KG" x={WALL_W - 4} y={118} color="#d8d2b4" align="right" />
          </div>

          <div className="stampbar">
            <img className="stampbar-frame" src={en('StampBarTop.png')} alt="" draggable={false} />
            <div className="stampbar-slots">
                <button type="button" className="stamp-slot denied" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'denied' }) }} disabled={!placed} title="DENEGAR">
                  <img src={STAMP_TOOL.denied} alt="Denegar" draggable={false} />
                </button>
                <button type="button" className="stamp-slot approved" onPointerDown={() => { play('button', 'down', { volume: 0.45 }); play('metal', 'grab', { volume: 0.4 }); setMode({ type: 'carry', kind: 'approved' }) }} disabled={!placed} title="APROBAR">
                  <img src={STAMP_TOOL.approved} alt="Aprobar" draggable={false} />
                </button>
            </div>
            <img className="stampbar-mid" src={en('StampBarMid.png')} alt="" draggable={false} />
            <img className="stampbar-bot" src={en('StampBarBot.png')} alt="" draggable={false} />
          </div>

          <div
            className="mesa"
            style={{ top: `${MESA.y}px`, width: `${MESA.w}px`, height: `${MESA.h}px` }}
          >
            {roster.map((doc) => {
              const slot = slotOf(doc)
              const live = mesaPos[doc.id]
              return (
                <button
                  type="button"
                  key={doc.id}
                  className="mesa-doc"
                  style={{
                    left: `${(live ? live.x - MESA.x : slot.x)}px`,
                    top: `${(live ? live.y - MESA.y : slot.y)}px`,
                    width: `${MESA_PAPER.w}px`,
                    height: `${MESA_PAPER.h}px`,
                    zIndex: zOrder[doc.id] ?? 1,
                    ['--rot' as string]: `${slot.rot}deg`,
                  }}
                  onPointerDown={(event) => startMesaDrag(event, doc)}
                  onPointerEnter={() => play('inspect', 'highlight', { volume: 0.22 })}
                  title={doc.title}
                  aria-label={`Arrastrar ${doc.title} a la mesa`}
                >
                  <img src={doc.image} alt="" draggable={false} />
                </button>
              )
            })}
          </div>

          <button type="button" className="tray-give" onClick={() => returnDocument()} disabled={!placed} title="Entregar">
            <img src={asset('GiveIcon.png')} alt="Entregar" draggable={false} />
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
                  <img src={asset('avatar.png')} alt="" draggable={false} />
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
                >
                  <img src={INK[stamp.kind]} alt="" draggable={false} style={{ transform: `rotate(${stamp.rot}deg)` }} />
                </div>
              ))}
            </div>
          )}

          {shutter && (
            <img
              className="shutter-sprite"
              src={en('Shutter.png')}
              alt=""
              draggable={false}
              onAnimationEnd={() => setShutter(false)}
            />
          )}

          <button type="button" className="sound" onClick={toggleMute} title="Sonido (M)">
            {muted ? 'MUTE' : 'SND'}
          </button>

          {/* el boton vive a la derecha del papel (que llega hasta x=418) para
              que ningun documento tapado pueda pillarlo */}
          <button
            type="button"
            className="btn-proyectos"
            onClick={() => setVerProyectos(true)}
            title="Ver proyectos"
          >
            PROYECTOS
          </button>
        </div>

        <PixelText className="hint" text={placed ? '' : 'ARRASTRE DOCUMENTOS AQUI'} x={420} y={302} color="#4c5251" align="center" />

        {verProyectos && <PanelProyectos onClose={() => setVerProyectos(false)} />}
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

      {!jugandoEnVertical && (
        <div className="rotate-card">
          <div className="rotate-inner">
            <span className="rotate-icon" aria-hidden="true" />
            <h2 className="rotate-title">GIRA EL MÓVIL</h2>
            <p className="rotate-text">
              El puesto de inspección se ve mucho mejor en horizontal.
            </p>
            <button
              type="button"
              className="rotate-skip"
              onClick={() => setJugandoEnVertical(true)}
            >
              JUGAR DE TODOS MODOS
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

