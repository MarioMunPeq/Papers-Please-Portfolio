import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DOCUMENTS, INSPECTOR, INTRO_LINES, type PortfolioDoc } from './portfolioData'
import './App.css'

const STAGE_W = 1140
const STAGE_H = 640
const TOPBAR_H = 44
const BOTBAR_H = 30
const DESK_H = STAGE_H - TOPBAR_H - BOTBAR_H
const LEFT_W = 300
const STACK_W = 190
const SURFACE_W = STAGE_W - LEFT_W - STACK_W
const TOOLBAR_H = 78
const MOVE_H = DESK_H - TOOLBAR_H
const PAPER_W = 300

type StampKind = 'approved' | 'denied' | 'reason'

interface PlacedStamp {
  id: number
  kind: StampKind
  rot: number
  offset: number
}

const INK: Record<StampKind, string> = {
  approved: '/assets/InkApproved.png',
  denied: '/assets/InkDenied.png',
  reason: '/assets/InkReason.png',
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function InspectorPanel() {
  return (
    <aside className="booth" aria-label="Puesto de inspección">
      <div className="booth-portrait">
        <div className="height-chart" aria-hidden="true">
          <span>1.9</span>
          <span>1.8</span>
          <span>1.7</span>
          <span>1.6</span>
          <span>1.5</span>
        </div>
        <div className="mugshot" role="img" aria-label={`Retrato de ${INSPECTOR.name}`}>
          <div className="mugshot-grid" />
          <div className="face">
            <div className="cap" />
            <div className="head">
              <div className="eye left" />
              <div className="eye right" />
              <div className="brow" />
              <div className="nose" />
              <div className="mouth" />
            </div>
            <div className="neck" />
            <div className="shoulders" />
          </div>
        </div>
        <div className="booth-name">{INSPECTOR.name}</div>
      </div>

      <div className="booth-tools" aria-hidden="true">
        <img src="/assets/SearchButton.png" alt="" />
        <img src="/assets/FingerprintButton.png" alt="" />
        <img src="/assets/DetainButton.png" alt="" />
      </div>

      <div className="booth-desk">
        <div className="booth-date">25.11.82</div>
        <img className="booth-filer" src="/assets/Filer.png" alt="" />
        <div className="booth-weight">87<span>kg</span></div>
      </div>
    </aside>
  )
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro">
      <div className="intro-inner">
        <img className="intro-emblem" src="/assets/intro/Intro1.png" alt="" />
        <img className="intro-title" src="/assets/intro/Shutter.png" alt="" />
        <div className="intro-letter">
          {INTRO_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="intro-signature">
          <span>M.D.A.</span>
          <img src="/assets/intro/Obrinspector.png" alt="" />
        </div>
        <button type="button" className="intro-start" onClick={onStart}>
          <img src="/assets/StampBotApproved.png" alt="" />
          <b>COMENZAR TURNO</b>
        </button>
      </div>
    </div>
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [scale, setScale] = useState(1)
  const [stack, setStack] = useState<PortfolioDoc[]>(DOCUMENTS)
  const [placed, setPlaced] = useState<PortfolioDoc | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [stamps, setStamps] = useState<PlacedStamp[]>([])
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const stampId = useRef(0)

  useEffect(() => {
    const fit = () => {
      const raw = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
      setScale(raw >= 1 ? Math.floor(raw) : raw)
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
    return () => {
      cancelled = true
    }
  }, [])

  const paperSize = useMemo(() => {
    const ratio = placed ? aspects[placed.id] : undefined
    if (!placed || !ratio) return { width: PAPER_W, height: PAPER_W }
    return { width: PAPER_W, height: Math.round(PAPER_W / ratio) }
  }, [placed, aspects])

  const placeDocument = useCallback((doc: PortfolioDoc) => {
    const ratio = aspects[doc.id] ?? 0.8
    const width = PAPER_W
    const height = Math.round(PAPER_W / ratio)
    setPlaced(doc)
    setStamps([])
    setSelected(doc.id)
    setStack((current) => current.filter((item) => item.id !== doc.id))
    setPosition({
      x: Math.round((SURFACE_W - width) / 2),
      y: Math.round((MOVE_H - height) / 2),
    })
  }, [aspects])

  const returnDocument = useCallback(() => {
    if (!placed) return
    setStack((current) => [...current, placed])
    setPlaced(null)
    setStamps([])
    setSelected(null)
  }, [placed])

  const applyStamp = useCallback((kind: StampKind) => {
    if (!placed) return
    const id = stampId.current++
    const rotation = -14 + Math.round(Math.random() * 22)
    setStamps((current) => [...current, { id, kind, rot: rotation, offset: current.length * 14 }])
  }, [placed])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!placed) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!bounds) return
    const scaleX = bounds.width / SURFACE_W
    const scaleY = bounds.height / MOVE_H
    dragRef.current = {
      dx: (event.clientX - bounds.left) / scaleX - position.x,
      dy: (event.clientY - bounds.top) / scaleY - position.y,
    }
  }, [placed, position])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !placed) return
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!bounds) return
    const scaleX = bounds.width / SURFACE_W
    const scaleY = bounds.height / MOVE_H
    const x = (event.clientX - bounds.left) / scaleX - dragRef.current.dx
    const y = (event.clientY - bounds.top) / scaleY - dragRef.current.dy
    setPosition({
      x: clamp(x, 6, SURFACE_W - paperSize.width - 6),
      y: clamp(y, 6, MOVE_H - paperSize.height - 6),
    })
  }, [placed, paperSize])

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }, [])

  if (!started) return <Intro onStart={() => setStarted(true)} />

  return (
    <div className="viewport">
      <div className="stage" style={{ transform: `scale(${scale})` }}>
        <header className="topbar" style={{ height: TOPBAR_H }}>
          <div className="brand">
            ARSTOTZKA
            <span>DEPARTMENT OF LABOR</span>
          </div>
          <div className="shift">
            25.11.82
            <span>SHIFT 01</span>
          </div>
          <div className="ministry-seal">M.D.A.</div>
        </header>

        <div className="desk" style={{ height: DESK_H }}>
          <InspectorPanel />

          <section className="archive" style={{ width: STACK_W }} aria-label="Archivo de entrada">
            <div className="archive-title">ARCHIVO DE ENTRADA</div>
            <div className="archive-slots">
              {stack.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  className="archive-slot"
                  onClick={() => placeDocument(doc)}
                  aria-label={`Inspeccionar ${doc.title}`}
                >
                  <img src={doc.image} alt="" />
                  <span>{doc.short}</span>
                </button>
              ))}
              {stack.length === 0 && <div className="archive-empty">ARCHIVO VACÍO</div>}
            </div>
          </section>

          <section className="surface" style={{ width: SURFACE_W }} aria-label="Zona de inspección">
            <div
              className="surface-move"
              style={{ height: MOVE_H }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="drag-hint">ARRASTRE LOS DOCUMENTOS AQUÍ</div>

              {placed && (
                <div
                  className={`paper${stamps.length ? ' stamped' : ''}`}
                  style={{
                    width: paperSize.width,
                    height: paperSize.height,
                    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                  }}
                  onPointerDown={handlePointerDown}
                  role="group"
                  aria-label={`${placed.title} sobre la mesa`}
                >
                  <img className="paper-sheet" src={placed.image} alt={placed.title} />
                  {placed.fields.map((field, index) => (
                    <span
                      key={index}
                      className={field.panel ? 'field panel' : 'field'}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: field.w ? `${field.w}%` : undefined,
                        height: field.h ? `${field.h}%` : undefined,
                        fontSize: field.size ? `${field.size}px` : undefined,
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
                    <img
                      key={stamp.id}
                      className="ink"
                      src={INK[stamp.kind]}
                      alt=""
                      style={{ ['--stamp-rot' as string]: `${stamp.rot}deg`, ['--stamp-drop' as string]: `${stamp.offset}px` }}
                    />
                  ))}
                </div>
              )}

              {placed && (
                <div className="paper-caption" style={{ left: clamp(position.x, 8, SURFACE_W - 320) }}>
                  <b>{placed.short}</b>
                  <span>{placed.subtitle}</span>
                </div>
              )}
            </div>

            <div className="toolbar" style={{ height: TOOLBAR_H }}>
              <img className="toolbar-bar" src="/assets/StampBarMid.png" alt="" />
              <div className="toolbar-actions">
                <button type="button" onClick={() => applyStamp('denied')} disabled={!placed} title="DENEGAR">
                  <img src="/assets/StampBotDenied.png" alt="Denegar" />
                </button>
                <button type="button" onClick={() => applyStamp('approved')} disabled={!placed} title="APROBAR">
                  <img src="/assets/StampBotApproved.png" alt="Aprobar" />
                </button>
                <button type="button" className="reason" disabled title="RAZÓN">
                  <img src="/assets/ReasonButton.png" alt="Razón" />
                </button>
                <button type="button" className="give" onClick={returnDocument} disabled={!placed} title="ENTREGAR">
                  <img src="/assets/GiveIcon.png" alt="Entregar" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="botbar" style={{ height: BOTBAR_H }}>
          <div className="botbar-case">
            CASO {String(DOCUMENTS.length - stack.length + (placed ? 0 : 1)).padStart(2, '0')} / {String(DOCUMENTS.length).padStart(2, '0')}
          </div>
          <div className="botbar-status">
            {placed ? `${placed.short} // ${placed.subtitle}` : 'ESPERANDO DOCUMENTACIÓN'}
          </div>
          <div className="botbar-hint">{selected ? 'ARRASTRE EL PAPEL PARA MOVERLO' : 'SELECCIONE UN DOCUMENTO DEL ARCHIVO'}</div>
        </footer>
      </div>
    </div>
  )
}

export default App
