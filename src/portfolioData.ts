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
  role: 'TFG DESARROLLO MULTIPLATAFORMA',
  location: 'VALLADOLID',
}

const INK = '#514a63'

/* proporcion real de cada papel, para poder maquetar sin esperar a que
   carguen las imagenes */
export const DOC_ASPECT: Record<string, number> = {
  passport: 130 / 162,
  id: 126 / 71,
  work: 147 / 135,
  diplomatic: 150 / 200,
  visa: 120 / 100,
  skills: 170 / 60,
  certificate: 135 / 156,
  rules: 246 / 160,
}

export const DOCUMENTS: PortfolioDoc[] = [  {
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
      { t: '27.11.2001', x: 53, y: 70.5, w: 24, size: 5, color: INK },
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
      { t: '24 · ESP', x: 62, y: 58, w: 26, size: 5, color: INK },
      { t: '183 CM', x: 62, y: 72, w: 26, size: 5, color: INK },
      { t: '85 KG', x: 62, y: 86, w: 26, size: 5, color: INK },
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
      /* el papel no deja hueco libre entre el parrafo (termina al 49,6%) y
         la fila NOMBRE (empieza al 50,4%), asi que las empresas anteriores
         van en el manual de protocolo */
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
      /* las etiquetas "AGENTE......." (puntos hasta el 61%) y "PASAPORTE....."
         (hasta el 39%) van grabadas, asi que los valores arrancan despues */
      { t: 'MUÑOZ PEQUEÑO, MARIO', x: 62, y: 47.5, w: 38, size: 4, color: INK },
      { t: 'ARST-0416-2033', x: 41, y: 54, w: 30, size: 4.5, color: INK },
      { t: 'MINECRAFT PORTFOLIO', x: 13, y: 77, w: 72, size: 4.5, color: INK },
      { t: 'PERSONA 5 PORTFOLIO', x: 13, y: 82.5, w: 72, size: 4.5, color: INK },
      { t: 'DUNGEON ARCHIVE', x: 13, y: 88, w: 72, size: 4.5, color: INK },
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
      { t: 'FP DESARROLLO', x: 20, y: 25, w: 60, size: 5, align: 'center', color: '#8a7f2e' },
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
      /* cinco columnas (una por recuadro punteado del papel) y tres filas:
         la principal y dos de detalle. Los anchos miden 17.5% del papel,
         que es justo lo que mide cada recuadro. */
      { t: 'JAVA', x: 3, y: 21, w: 17.5, size: 4.5, align: 'center', color: INK },
      { t: 'Odoo', x: 3, y: 28, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Liferay', x: 3, y: 35, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'PYTHON', x: 22, y: 21, w: 17.5, size: 4.5, align: 'center', color: INK },
      { t: 'Pandas', x: 22, y: 28, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'PyTorch', x: 22, y: 35, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'KOTLIN', x: 40.5, y: 21, w: 17.5, size: 4.5, align: 'center', color: INK },
      { t: 'Unity', x: 40.5, y: 28, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Godot', x: 40.5, y: 35, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'C#', x: 59.5, y: 21, w: 17.5, size: 4.5, align: 'center', color: INK },
      { t: 'Figma', x: 59.5, y: 28, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Firebase', x: 59.5, y: 35, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'SQL', x: 78.5, y: 21, w: 17.5, size: 4.5, align: 'center', color: INK },
      { t: 'Git', x: 78.5, y: 28, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
      { t: 'Actions', x: 78.5, y: 35, w: 17.5, size: 3.5, align: 'center', color: '#8b86a0' },
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
      { t: '01', x: 12, y: 41.5, w: 20, size: 4.5, color: '#6b4a2c' },
      { t: '2024', x: 13, y: 61, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'OXFORD B2 INGLÉS', x: 45, y: 61, w: 48, size: 4, color: '#6b4a2c' },
      { t: '2024', x: 13, y: 69.5, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'PERMISO DE CONDUCIR B', x: 45, y: 69.5, w: 48, size: 4, color: '#6b4a2c' },
      { t: '2024', x: 13, y: 78, w: 26, size: 4, color: '#6b4a2c' },
      { t: 'MENCIÓN HONORÍFICA TFG', x: 45, y: 78, w: 48, size: 4, color: '#6b4a2c' },
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
      /* cinco huecos por pagina, marcados en el papel a y = 18,5 / 33,5 /
         48,5 / 63,5 / 78,5. El texto arranca en x 11,5 (izq) y 60 (der),
         justo detras del cuadrito del marcador. */
      { t: 'GITHUB', x: 11.5, y: 18.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'github.com/MarioMunPeq', x: 11.5, y: 24.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'LINKEDIN', x: 11.5, y: 33.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'linkedin.com/in/mario-munoz-', x: 11.5, y: 39.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'pequeno', x: 11.5, y: 44.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'EXPERIENCIA', x: 11.5, y: 50.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'COGNIZANT · DIPUTACIÓN', x: 11.5, y: 56.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'MICHELIN · SYNERSIGHT', x: 11.5, y: 61.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'CERTIFICACIONES', x: 11.5, y: 65.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'OXFORD B2 INGLÉS · TFG', x: 11.5, y: 71.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'PROYECTOS', x: 11.5, y: 80.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'MINECRAFT · PERSONA 5', x: 11.5, y: 86.5, w: 34, size: 3.5, color: '#4a4a38' },

      { t: 'CONTACTO', x: 60, y: 18.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'VALLADOLID, ES', x: 60, y: 24.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'INTERESES', x: 60, y: 33.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'INTELIGENCIA ARTIFICIAL', x: 60, y: 39.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'BACKEND · AUTOMATIZACIÓN', x: 60, y: 44.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'VIDEOJUEGOS', x: 60, y: 49.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'TECNOLOGÍAS', x: 60, y: 58.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'JAVA · PYTHON · KOTLIN', x: 60, y: 64.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'C# · SQL · GIT', x: 60, y: 69.5, w: 34, size: 3.5, color: '#4a4a38' },
      { t: 'FORMACIÓN', x: 60, y: 78.5, w: 34, size: 4, bold: true, color: '#4a4a38' },
      { t: 'TFG DESARROLLO 2022-2024', x: 60, y: 84.5, w: 34, size: 3.5, color: '#4a4a38' },
    ],
  },
]

export interface IntroScreen {
  image: string
  alt: string
  lines: string[]
  cta: string
}

const CLEAN = '/assets-english/intro-clean'

export const INTRO_SCREENS: IntroScreen[] = [
  {
    image: `${CLEAN}/Intro0.png`,
    alt: 'Carta del Ministerio de Admisión de {mes}',
    lines: [
      'El sorteo laboral del {} {mes} ha terminado.',
      'Su nombre ha sido seleccionado.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: `${CLEAN}/Passport1.png`,
    alt: 'Documentación personal',
    lines: [
      'Para su colocación inmediata, preséntese en el',
      'Ministerio de Admisión, Puesto de Frontera de Grestin.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: `${CLEAN}/Passport3.png`,
    alt: 'Documentación del solicitante',
    lines: [
      'Se le proporcionará un apartamento para usted y',
      'su familia en Grestin Este. Clase-8.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: `${CLEAN}/Arstotzka.png`,
    alt: 'Arstotzka',
    lines: [
      'Gloria a Arstotzka.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: `${CLEAN}/Obrinspector.png`,
    alt: 'Puesto de inspección',
    lines: [
      'Su plaza ha sido asignada: inspector de admisiones.',
      'Revise la documentación. Observe todos sus datos y juzgue usted mismo.',
    ],
    cta: 'CONTINUAR',
  },
  {
    image: `${CLEAN}/WaitingLine.png`,
    alt: 'Cola de solicitantes',
    lines: [
      'El desarrollador espera en la cola de solicitantes. Revise su documentación y prepárese para el turno.',
    ],
    cta: 'COMENZAR TURNO',
  },
]
