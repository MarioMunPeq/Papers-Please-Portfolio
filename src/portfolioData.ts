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

export interface DocPhoto {
  x: number
  y: number
  w: number
  h: number
  tint: string
  blend: string
}

export interface PortfolioDoc {
  id: string
  short: string
  title: string
  subtitle: string
  image: string
  native: number
  photo?: DocPhoto
  fields: DocField[]
}

export const INSPECTOR = {
  name: 'MUÑOZ PEQUEÑO',
  role: 'TSR DESARROLLO MULTIPLATAFORMA',
  location: 'VALLADOLID',
}

const INK = '#514a63'

export const DOCUMENTS: PortfolioDoc[] = [
  {
    id: 'passport',
    short: 'PASSPORT',
    title: 'Pasaporte · Perfil profesional',
    subtitle: 'PERFIL PROFESIONAL',
    image: '/assets/papers/PassportInnerArstotzka.png',
    native: 130,
    photo: { x: 6.2, y: 60, w: 30.8, h: 30, tint: '#8d8494', blend: 'multiply' },
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 4, y: 56.5, w: 62, size: 5, color: INK },
      { t: 'ESP', x: 53, y: 60.5, w: 18, size: 5, color: INK },
      { t: 'M', x: 53, y: 65.5, w: 18, size: 5, color: INK },
      { t: '06.11.33', x: 53, y: 70.5, w: 24, size: 5, color: INK },
      { t: 'VLL', x: 53, y: 75.5, w: 24, size: 5, color: INK },
      { t: 'FP-0416-2033', x: 4, y: 91, w: 60, size: 4.5, color: '#8d8a80' },
    ],
  },
  {
    id: 'id',
    short: 'ID CARD',
    title: 'Documento de identidad',
    subtitle: 'DATOS PERSONALES',
    image: '/assets/papers/IdCardInner.png',
    native: 126,
    photo: { x: 4.5, y: 24, w: 32, h: 65, tint: '#b6a9c9', blend: 'multiply' },
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 37, y: 30, w: 58, size: 5, color: INK },
      { t: '20 · ESP', x: 62, y: 58, w: 26, size: 5, color: INK },
      { t: '178 CM', x: 62, y: 72, w: 26, size: 5, color: INK },
      { t: '72 KG', x: 62, y: 86, w: 26, size: 5, color: INK },
    ],
  },
  {
    id: 'work',
    short: 'WORK PERMIT',
    title: 'Permiso de trabajo',
    subtitle: 'EXPERIENCIA LABORAL',
    image: '/assets/papers/WorkPermitInner.png',
    native: 147,
    fields: [
      { t: 'DESARROLLADOR WEB', x: 25, y: 51, w: 70, size: 5, color: INK },
      { t: 'COGNIZANT · 2026 - ACT.', x: 25, y: 62.5, w: 70, size: 5, color: INK },
      { t: 'DIPUTACIÓN VALLADOLID 2026', x: 25, y: 74, w: 70, size: 5, color: INK },
      { t: 'MICHELIN · SYNERSIGHT', x: 8, y: 80.5, w: 86, size: 4, color: '#8b86a0' },
      { t: 'PRÁCTICAS 2024 / 2022', x: 8, y: 84.5, w: 86, size: 4, color: '#8b86a0' },
    ],
  },
  {
    id: 'diplomatic',
    short: 'DIPLOMATIC AUTH',
    title: 'Autorización diplomática',
    subtitle: 'PROYECTOS DESTACADOS',
    image: '/assets/papers/DiplomaticAuthInner.png',
    native: 150,
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 39, y: 46, w: 58, size: 6, color: INK },
      { t: 'ARST-0416-2033', x: 37, y: 52, w: 60, size: 6, color: INK },
      { t: 'MINECRAFT PORTFOLIO', x: 14, y: 74.5, w: 79, size: 5, color: INK },
      { t: 'PERSONA 5 PORTFOLIO', x: 14, y: 79.5, w: 79, size: 5, color: INK },
      { t: 'DUNGEON / COSMERE ARCHIVE', x: 14, y: 84.5, w: 79, size: 5, color: INK },
    ],
  },
  {
    id: 'visa',
    short: 'ENTRY VISA',
    title: 'Visado de estudios',
    subtitle: 'FORMACIÓN',
    image: '/assets/papers/VisaSlipInner.png',
    native: 120,
    fields: [
      { t: 'TSR DESARROLLO', x: 20, y: 25, w: 60, size: 5, align: 'center', color: '#8a7f2e' },
      { t: 'MULTIPLATAFORMA', x: 20, y: 36, w: 60, size: 5, align: 'center', color: '#8a7f2e' },
      { t: '2022 - 2024', x: 20, y: 47, w: 60, size: 4.5, align: 'center', color: '#9c9350' },
    ],
  },
  {
    id: 'skills',
    short: 'FINGERPRINTS',
    title: 'Registro de habilidades',
    subtitle: 'TECNOLOGÍAS',
    image: '/assets/papers/FingerprintsInner.png',
    native: 170,
    fields: [
      { t: 'JAVA', x: 4, y: 28, w: 14, size: 4.5, align: 'center', color: INK },
      { t: 'PYTHON', x: 21, y: 28, w: 14, size: 4.5, align: 'center', color: INK },
      { t: 'KOTLIN', x: 38, y: 28, w: 14, size: 4.5, align: 'center', color: INK },
      { t: 'C# · SQL', x: 55, y: 28, w: 14, size: 4.5, align: 'center', color: INK },
      { t: 'GIT', x: 72, y: 28, w: 14, size: 4.5, align: 'center', color: INK },
      { t: 'Odoo · Lifery', x: 4, y: 42, w: 14, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Pandas · PyTorch', x: 21, y: 42, w: 14, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Unity · Godot', x: 38, y: 42, w: 14, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Figma · Firebase', x: 55, y: 42, w: 14, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Android Studio', x: 72, y: 42, w: 14, size: 3.5, align: 'center', color: '#8b86a0' },
    ],
  },
  {
    id: 'certificate',
    short: 'VACCINE CERT',
    title: 'Certificado de certificaciones',
    subtitle: 'CERTIFICACIONES',
    image: '/assets/papers/VaccineCertInner.png',
    native: 135,
    fields: [
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 12, y: 34, w: 76, size: 4.5, color: '#6b4a2c' },
      { t: '24', x: 12, y: 41.5, w: 20, size: 4.5, color: '#6b4a2c' },
      { t: '24', x: 13, y: 61, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'CAMBRIDGE B2 INGLÉS', x: 45, y: 61, w: 48, size: 4, color: '#6b4a2c' },
      { t: '24', x: 13, y: 69.5, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'PERMITO DE CONDUCIR B', x: 45, y: 69.5, w: 48, size: 4, color: '#6b4a2c' },
      { t: '24', x: 13, y: 78, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'MENCIÓN HONORÍFICA TSR', x: 45, y: 78, w: 48, size: 4, color: '#6b4a2c' },
    ],
  },
  {
    id: 'rules',
    short: 'RULES',
    title: 'Manual de protocolo',
    subtitle: 'INFORMACIÓN ADICIONAL',
    image: '/assets/papers/RulesInnerBasic.png',
    native: 246,
    fields: [
      { t: 'GITHUB', x: 10, y: 16, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'github.com/MarioMunPeq', x: 10, y: 22, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'LINKEDIN', x: 10, y: 31, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'linkedin.com/in/mario-munoz-', x: 10, y: 37, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'pequeno', x: 10, y: 42, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'CONTACTO', x: 60, y: 16, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'VALLADOLID, ES', x: 60, y: 22, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'INTERESES', x: 60, y: 31, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'INTELIGENCIA ARTIFICIAL', x: 60, y: 37, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'BACKEND · AUTOMATIZACIÓN', x: 60, y: 42, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'VIDEOJUEGOS', x: 60, y: 51, w: 34, size: 3.5, color: '#4a4a38' },
    ],
  },
]

export interface IntroScreen {
  image: string
  alt: string
  lines: string[]
  cta: string
}

export const INTRO_SCREENS: IntroScreen[] = [
  {
    image: '/assets/intro-clean/Shutter.png',
    alt: 'Inmigración Obristán',
    lines: [],
    cta: 'CONTINUAR',
  },
  {
    image: '/assets/intro-clean/Intro1.png',
    alt: 'Sorteo laboral, octubre de 1982',
    lines: [
      'El sorteo laboral de octubre ha terminado.',
      'Su nombre ha sido seleccionado.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: '/assets/intro-clean/Arstotzka.png',
    alt: 'Arstotzka',
    lines: [
      'Felicidades. Para su colocación inmediata, preséntese en el Ministerio de Admisión, Puesto de Frontera de Grestin.',
      'Se le proporcionará un apartamento para usted y su familia en Grestin Este.',
      'Gloria a Arstotzka.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: '/assets/intro-clean/Obrinspector.png',
    alt: 'Ministerio de Admisión',
    lines: [
      'Su plaza ha sido asignada como inspector de admisiones.',
      'Revise la documentación. Apruebe o deniegue.',
    ],
    cta: 'COMENZAR TURNO',
  },
]
