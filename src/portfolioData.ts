export interface DocField {
  t?: string
  x: number
  y: number
  w?: number
  h?: number
  size?: number
  align?: 'left' | 'center' | 'right'
  bold?: boolean
  color?: string
  bg?: string
  panel?: boolean
}

export interface PortfolioDoc {
  id: string
  short: string
  title: string
  subtitle: string
  image: string
  fields: DocField[]
}

export const INSPECTOR = {
  name: 'MUÑOZ PEQUEÑO',
  role: 'TSR DESARROLLO MULTIPLATAFORMA',
  location: 'VALLADOLID',
}

export const DOCUMENTS: PortfolioDoc[] = [
  {
    id: 'passport',
    short: 'PASSPORT',
    title: 'Pasaporte · Perfil profesional',
    subtitle: 'PERFIL PROFESIONAL',
    image: '/assets/papers/PassportInnerArstotzka.png',
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 7, y: 57, w: 86, size: 7, bold: true },
      { t: 'ESP', x: 46, y: 66, w: 18, size: 6 },
      { t: 'M', x: 46, y: 73, w: 18, size: 6 },
      { t: '2033', x: 46, y: 80, w: 22, size: 6 },
      { t: 'VALLADOLID', x: 46, y: 87, w: 40, size: 5.5 },
    ],
  },
  {
    id: 'id',
    short: 'ID CARD',
    title: 'Documento de identidad',
    subtitle: 'DATOS PERSONALES',
    image: '/assets/papers/IdCardInner.png',
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 32, y: 20, w: 64, size: 7, bold: true },
      { t: 'ESP', x: 58, y: 40, w: 16, size: 6.5 },
      { t: '178', x: 58, y: 51, w: 16, size: 6.5 },
      { t: '72', x: 58, y: 62, w: 16, size: 6.5 },
    ],
  },
  {
    id: 'work',
    short: 'WORK PERMIT',
    title: 'Permiso de trabajo',
    subtitle: 'EXPERIENCIA LABORAL',
    image: '/assets/papers/WorkPermitInner.png',
    fields: [
      { t: 'DESARROLLADOR WEB', x: 36, y: 41, w: 58, size: 8, bold: true },
      { t: 'SOFTWARE / IA / BACKEND', x: 36, y: 51, w: 58, size: 7 },
      { t: 'COGNIZANT · 2026 - ACT.', x: 36, y: 61, w: 58, size: 7 },
      { t: 'DIPUTACIÓN DE VALLADOLID · 2026', x: 8, y: 71, w: 88, size: 6.5 },
      { t: 'MICHELIN (PRÁCTICAS DAM) · 2024', x: 8, y: 78, w: 88, size: 6.5 },
      { t: 'SYNERSIGHT S.L. (PRÁCTICAS ARI) · 2022', x: 8, y: 85, w: 88, size: 6.5 },
    ],
  },
  {
    id: 'diplomatic',
    short: 'DIPLOMATIC AUTH',
    title: 'Autorización diplomática',
    subtitle: 'PROYECTOS DESTACADOS',
    image: '/assets/papers/DiplomaticAuthInner.png',
    fields: [
      { t: 'MARIO MUÑOZ PEQUEÑO', x: 40, y: 40, w: 56, size: 8, bold: true },
      { t: 'ARSTOTZKA-2033-XK', x: 40, y: 50, w: 56, size: 7 },
      { panel: true, x: 8, y: 58, w: 82, h: 34, bg: '#eceadb' },
      { t: 'PROYECTOS DESTACADOS', x: 10, y: 60, w: 78, size: 6.5, align: 'center', bold: true },
      { t: 'MINECRAFT PORTFOLIO', x: 10, y: 68, w: 78, size: 6.5, align: 'center' },
      { t: 'PORTFOLIO PERSONA 5', x: 10, y: 74, w: 78, size: 6.5, align: 'center' },
      { t: 'COSMERE / DUNGEON ARCHIVE', x: 10, y: 80, w: 78, size: 6.5, align: 'center' },
      { t: 'REPOSITORY LIBRARY · VAULT ARCHIVE', x: 10, y: 86, w: 78, size: 5.5, align: 'center' },
    ],
  },
  {
    id: 'visa',
    short: 'ENTRY VISA',
    title: 'Visado de estudios',
    subtitle: 'FORMACIÓN',
    image: '/assets/papers/VisaSlipInner.png',
    fields: [
      { t: 'TSR EN DESARROLLO DE', x: 8, y: 19, w: 84, size: 7, align: 'center' },
      { t: 'APLICACIONES MULTIPLATAFORMA', x: 8, y: 27, w: 84, size: 7, align: 'center', bold: true },
      { t: 'VÁLIDO 4 AÑOS', x: 8, y: 35, w: 84, size: 6, align: 'center' },
    ],
  },
  {
    id: 'skills',
    short: 'FINGERPRINTS',
    title: 'Registro de habilidades',
    subtitle: 'TECNOLOGÍAS',
    image: '/assets/papers/FingerprintsInner.png',
    fields: [
      { t: 'JAVA', x: 4, y: 34, w: 15, size: 6, align: 'center', bold: true },
      { t: 'PYTHON', x: 21, y: 34, w: 15, size: 6, align: 'center', bold: true },
      { t: 'KOTLIN', x: 38, y: 34, w: 15, size: 6, align: 'center', bold: true },
      { t: 'C#', x: 55, y: 34, w: 15, size: 6, align: 'center', bold: true },
      { t: 'SQL', x: 72, y: 34, w: 15, size: 6, align: 'center', bold: true },
    ],
  },
  {
    id: 'certificate',
    short: 'VACCINE CERT',
    title: 'Certificado de certificaciones',
    subtitle: 'CERTIFICACIONES',
    image: '/assets/papers/VaccineCertInner.png',
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 28, y: 30, w: 68, size: 7, bold: true },
      { t: '2024', x: 8, y: 48, w: 34, size: 6 },
      { t: 'CAMBRIDGE B2 INGLÉS', x: 50, y: 48, w: 46, size: 6 },
      { t: '2024', x: 8, y: 56, w: 34, size: 6 },
      { t: 'PERMITO DE CONDUCIR B', x: 50, y: 56, w: 46, size: 6 },
      { t: '2024', x: 8, y: 64, w: 34, size: 6 },
      { t: 'MENCIÓN HONORÍFICA TSR', x: 50, y: 64, w: 46, size: 6 },
    ],
  },
  {
    id: 'rules',
    short: 'RULES',
    title: 'Manual de protocolo',
    subtitle: 'INFORMACIÓN ADICIONAL',
    image: '/assets/papers/RulesInnerBasic.png',
    fields: [
      { t: 'INFORMACIÓN', x: 6, y: 14, w: 40, size: 6.5, bold: true },
      { t: 'GITHUB', x: 6, y: 26, w: 40, size: 6, bold: true },
      { t: 'github.com/MarioMunPeq', x: 6, y: 32, w: 40, size: 5 },
      { t: 'LINKEDIN', x: 6, y: 44, w: 40, size: 6, bold: true },
      { t: 'linkedin.com/in/', x: 6, y: 50, w: 40, size: 5 },
      { t: 'mario-munoz-pequeno', x: 6, y: 55, w: 40, size: 5 },
      { t: 'CONTACTO', x: 56, y: 14, w: 40, size: 6.5, bold: true },
      { t: 'VALLADOLID, ES', x: 56, y: 26, w: 40, size: 6 },
      { t: 'INTERESES', x: 56, y: 40, w: 40, size: 6, bold: true },
      { t: 'INTELIGENCIA ARTIFICIAL', x: 56, y: 46, w: 40, size: 5 },
      { t: 'BACKEND · AUTOMATIZACIÓN', x: 56, y: 51, w: 40, size: 5 },
      { t: 'VIDEOJUEGOS', x: 56, y: 56, w: 40, size: 5 },
    ],
  },
]

export const INTRO_LINES = [
  'El SORTEO LABORAL de octubre ha terminado.',
  'Su nombre ha sido seleccionado.',
  'Inmediatamente, preséntese en el Ministerio de Admisión, Puesto de frontera de Grestin.',
  'Se le proporcionará un apartamento para usted y su familia en Grestin Este.',
  'Gloria a Arstotzka.',
]
