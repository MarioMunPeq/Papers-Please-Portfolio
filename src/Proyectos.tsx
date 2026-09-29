import { PROJECTS } from './portfolioData'
import { en } from './paths'

/* El panel cabe entero en el stage (570x320), asi que no hace falta tocar
   el papel ni los sellos: se abre encima y se cierra con la X o con ESC.
   Los enlaces son <a> de verdad para que funcionen ctrl+clic, boton central
   y los lectores de pantalla. */
export function PanelProyectos({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="panel-proyectos"
      role="dialog"
      aria-label="Proyectos"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <img className="panel-art" src={en('ScreenHeader.png')} alt="" draggable={false} />
      <h2 className="panel-titulo">EXPEDIENTES</h2>
      <button type="button" className="panel-cerrar" onClick={onClose} aria-label="Cerrar proyectos">
        X
      </button>

      <ul className="panel-lista">
        {PROJECTS.map((proyecto) => (
          <li key={proyecto.n} className="panel-fila">
            <span className="panel-num">{proyecto.n}</span>
            <span className="panel-placa">
              <span className="panel-nombre">{proyecto.nombre}</span>
              <span className="panel-lenguaje">{proyecto.tech}</span>
            </span>
            <span className="panel-desc">{proyecto.desc}</span>
            <a
              className="panel-btn"
              href={proyecto.repo}
              target="_blank"
              rel="noopener noreferrer"
            >
              CODIGO
            </a>
            <a
              className="panel-btn"
              href={proyecto.demo}
              target="_blank"
              rel="noopener noreferrer"
            >
              DEMO
            </a>
          </li>
        ))}
      </ul>

      <p className="panel-pie">
        <span>{PROJECTS.length} PROYECTOS · CODIGO = REPOSITORIO · DEMO = EN VIVO</span>
        <span className="panel-esc">ESC PARA VOLVER</span>
      </p>
    </div>
  )
}
