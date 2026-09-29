/* Datos dinamicos de la introduccion: el reloj del visitante, el calendario
   de festivos (estatal + Castilla y Leon) y la API publica de GitHub.
   Todo se calcula en el navegador, no se guarda nada y si GitHub falla
   se muestran textos de reserva. */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

const dos = (n: number) => String(n).padStart(2, '0')

/* Festivos de fecha fija: Fiesta Nacional de España y los autonómicos de
   Castilla y León (23 de abril y 8 de septiembre). Se han dejado fuera los
   que solo son festivos en otras comunidades o en municipios concretos
   (San José, 2 de mayo, San Juan) porque en Valladolid no lo son.
   Para actualizar un año nuevo basta con revisar la lista de CyL. */
const FESTIVOS_FIJOS: Record<string, string> = {
  '01-01': 'Año Nuevo',
  '01-06': 'Epifanía del Señor',
  '04-23': 'Día de Castilla y León',
  '05-01': 'Fiesta del Trabajo',
  '08-15': 'Asunción de la Virgen',
  '09-08': 'Batalla de Villalar',
  '10-12': 'Fiesta Nacional de España',
  '11-01': 'Todos los Santos',
  '12-06': 'Día de la Constitución',
  '12-08': 'Inmaculada Concepción',
  '12-25': 'Navidad',
}

/* Domingo de Pascua por el algoritmo de Meeus/Butcher */
function pascua(anio: number): Date {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes - 1, dia)
}

const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/* nombre del festivo de hoy, o cadena vacia si no es festivo */
export function festivoDe(fecha: Date): string {
  const clave = dos(fecha.getMonth() + 1) + '-' + dos(fecha.getDate())
  const fijo = FESTIVOS_FIJOS[clave]
  if (fijo) return fijo

  const domingo = pascua(fecha.getFullYear())
  const jueves = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() - 3)
  if (mismoDia(jueves, fecha)) return 'Jueves Santo'

  const viernes = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() - 2)
  if (mismoDia(viernes, fecha)) return 'Viernes Santo'

  return ''
}

export type Franja = 'madrugada' | 'manana' | 'tarde' | 'noche'

export function franjaDe(hora: number): Franja {
  if (hora < 6) return 'madrugada'
  if (hora < 14) return 'manana'
  if (hora < 21) return 'tarde'
  return 'noche'
}

const FRANJA: Record<Franja, { saludo: string; frase: string }> = {
  madrugada: { saludo: 'Buenas noches', frase: 'Turno de noche. Menos cola, menos ruido.' },
  manana: { saludo: 'Buenos días', frase: 'El turno empieza puntual.' },
  tarde: { saludo: 'Buenas tardes', frase: 'Aún queda media tarde de trabajo.' },
  noche: { saludo: 'Buenas noches', frase: 'Puesto cerrado en teoría. Abierto en la práctica.' },
}

export interface Github {
  repo: string
  lenguaje: string
  push: string
  norepos: number
}

/* valores de reserva cuando GitHub no responde o se agota el limite de
   60 peticiones por hora y por IP */
const SIN_GITHUB = { repo: 'este portfolio', lenguaje: 'TypeScript', push: 'sin conexión', norepos: 0 }

function relativo(iso: string): string {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 2) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  const dias = Math.round(horas / 24)
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  const meses = Math.round(dias / 30)
  if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  return `hace ${Math.round(meses / 12)} años`
}

export async function cargaGithub(): Promise<Github | null> {
  try {
    const lista = await fetch(
      'https://api.github.com/users/MarioMunPeq/repos?sort=pushed&per_page=1',
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (!lista.ok) return null
    const [repos] = (await lista.json()) as { name: string; pushed_at: string; language: string | null }[]
    if (!repos) return null

    const perfil = await fetch('https://api.github.com/users/MarioMunPeq', {
      headers: { Accept: 'application/vnd.github+json' },
    })
    const datos = perfil.ok
      ? ((await perfil.json()) as { public_repos: number })
      : { public_repos: 0 }

    return {
      repo: repos.name,
      lenguaje: repos.language ?? 'TypeScript',
      push: relativo(repos.pushed_at),
      norepos: datos.public_repos,
    }
  } catch {
    return null
  }
}

export interface IntroCtx {
  dia: string
  mes: string
  anio: string
  diaSemana: string
  hora: string
  saludo: string
  frase: string
  festivo: string
}

/* Si la url trae ?fecha=AAAA-MM-DD se usa ese dia en vez del de hoy.
   Sirve para previsualizar la introduccion de un festivo. */
export function fechaDeUrl(): Date | undefined {
  const crudo = new URLSearchParams(window.location.search).get('fecha')
  if (!crudo) return undefined
  const [a, m, d] = crudo.split('-').map(Number)
  if (!a || !m || !d) return undefined
  const fecha = new Date(a, m - 1, d, new Date().getHours(), new Date().getMinutes())
  return Number.isNaN(fecha.getTime()) ? undefined : fecha
}

/* Se puede pasar ?fecha=AAAA-MM-DD en la url para previsualizar la
   introduccion de otro dia (util para ver como queda un festivo). */
export function ctxIntro(fecha?: Date): IntroCtx {
  const ahora = fecha ?? new Date()
  const franja = FRANJA[franjaDe(ahora.getHours())]
  return {
    dia: String(ahora.getDate()),
    mes: MESES[ahora.getMonth()],
    anio: String(ahora.getFullYear()),
    diaSemana: DIAS[ahora.getDay()],
    hora: `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`,
    saludo: franja.saludo,
    frase: franja.frase,
    festivo: festivoDe(ahora),
  }
}

/* sustituye las etiquetas {dia}, {mes}, {github}... por su valor actual */
export function rellena(texto: string, ctx: IntroCtx, github: Github | null): string {
  const datos: Record<string, string> = {
    dia: ctx.dia,
    mes: ctx.mes,
    anio: ctx.anio,
    diaSemana: ctx.diaSemana,
    hora: ctx.hora,
    saludo: ctx.saludo,
    frase: ctx.frase,
    festivo: ctx.festivo,
    repo: github?.repo ?? SIN_GITHUB.repo,
    lenguaje: github?.lenguaje ?? SIN_GITHUB.lenguaje,
    push: github?.push ?? SIN_GITHUB.push,
    norepos: github && github.norepos > 0 ? String(github.norepos) : 'Varios',
  }
  return texto.replace(/\{(\w+)\}/g, (todo, clave: string) => datos[clave] ?? todo)
}
