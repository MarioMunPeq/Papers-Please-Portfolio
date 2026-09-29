import GLYPH_MAP from './glyphmap.json'

export interface Glyph {
  x: number
  y: number
  w: number
  h: number
  advance: number
}

const CHAR_ORDER =
  '!"¡%$:@\')()+,-./0123456789' +
  ':;<=>?@ABCDEFGHIJKLMNOP' +
  'QRSTUVWXYZ[\\]^_`abcdefg' +
  'hijklmnopqrstuvwxyz{|}~ '

const ACCENTS: Record<string, number> = {
  Á: 99, À: 100, Ä: 101, Å: 102, Æ: 103,
  Ç: 104, È: 105, É: 106, Ê: 107, Ë: 108,
  Ì: 109, Í: 110, Î: 111, Ï: 112,
  Ò: 113, Ó: 114, Ô: 115, Ö: 116, Õ: 117, Ø: 118,
  Ù: 119, Ú: 120, Û: 121, Ü: 122, Ý: 123,
  ß: 128, ó: 149, ú: 158, ñ: 163, ã: 164, ç: 165, ý: 162,
  '¿': 98, '×': 96, '÷': 97,
}

const FOLD: Record<string, string> = {
  Á: 'A', À: 'A', Ä: 'A', Å: 'A', Æ: 'A',
  Ç: 'C', È: 'E', É: 'E', Ê: 'E', Ë: 'E',
  Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
  Ò: 'O', Ó: 'O', Ô: 'O', Ö: 'O', Õ: 'O', Ø: 'O',
  Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U', Ý: 'Y',
  Ñ: 'N', á: 'a', à: 'a', ä: 'a', å: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', ö: 'o', õ: 'o', ø: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ñ: 'n', ý: 'y', ç: 'c',
}

let glyphs: Glyph[] | null = null
let sheet: HTMLImageElement | null = null
let loading: Promise<Glyph[]> | null = null

function segment(): Glyph[] {
  return (GLYPH_MAP as Array<{ x: number; y: number; w: number; h: number }>).map((glyph) => ({
    x: glyph.x,
    y: glyph.y,
    w: glyph.w,
    h: glyph.h,
    advance: glyph.w + 1,
  }))
}

export function loadBitmapFont(src: string): Promise<Glyph[]> {
  if (glyphs) return Promise.resolve(glyphs)
  if (loading) return loading

  loading = new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      sheet = image
      glyphs = segment()
      resolve(glyphs)
    }
    image.onerror = () => resolve([])
    image.src = src
  })

  return loading
}

function indexFor(char: string): number {
  const direct = CHAR_ORDER.indexOf(char)
  if (direct >= 0) return direct
  const accented = ACCENTS[char]
  if (accented !== undefined) return accented
  const folded = FOLD[char] ?? char
  return CHAR_ORDER.indexOf(folded)
}

export interface PixelTextProps {
  text: string
  x?: number
  y?: number
  color?: string
  scale?: number
  align?: 'left' | 'center' | 'right'
  className?: string
  style?: React.CSSProperties
}

export function measureText(text: string): number {
  if (!glyphs) return text.length * 5
  let total = 0
  for (const char of text) {
    if (char === ' ') { total += 4; continue }
    const index = indexFor(char)
    const glyph = index >= 0 ? glyphs[index] : undefined
    total += glyph ? glyph.advance : 5
  }
  return total
}

export function textHeight(): number {
  return glyphs && glyphs.length > 0 ? Math.max(...glyphs.slice(0, 95).map((g) => g.h)) : 8
}

export function PixelText({
  text,
  x = 0,
  y = 0,
  color = '#c9c4b2',
  scale = 1,
  align = 'left',
  className,
  style,
}: PixelTextProps) {
  const ref = (element: HTMLCanvasElement | null) => {
    if (!element || !sheet || !glyphs) return

    const width = Math.max(1, Math.ceil(measureText(text) * scale) + 4)
    const height = Math.max(1, Math.ceil(12 * scale) + 4)
    element.width = width
    element.height = height

    const ctx = element.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = false

    const sheetCanvas = document.createElement('canvas')
    sheetCanvas.width = sheet.naturalWidth
    sheetCanvas.height = sheet.naturalHeight
    const sheetCtx = sheetCanvas.getContext('2d')
    if (!sheetCtx) return
    sheetCtx.drawImage(sheet, 0, 0)

    const total = measureText(text)
    void total
    let cursor = 0

    for (const char of text) {
      if (char === ' ') { cursor += 4; continue }
      const index = indexFor(char)
      const glyph = index >= 0 ? glyphs[index] : undefined
      if (glyph) {
        const px = Math.round(cursor * scale) + 2
        const py = Math.round((11 - glyph.h) * scale) + 2
        ctx.save()
        ctx.globalCompositeOperation = 'source-over'
        const tinted = document.createElement('canvas')
        tinted.width = glyph.w
        tinted.height = glyph.h
        const tctx = tinted.getContext('2d')
        if (tctx) {
          tctx.drawImage(sheetCanvas, glyph.x, glyph.y, glyph.w, glyph.h, 0, 0, glyph.w, glyph.h)
          tctx.globalCompositeOperation = 'source-in'
          tctx.fillStyle = color
          tctx.fillRect(0, 0, glyph.w, glyph.h)
          ctx.drawImage(tinted, px, py, glyph.w * scale, glyph.h * scale)
        }
        ctx.restore()
        cursor += glyph.advance
      } else {
        cursor += 5
      }
    }
  }

  const total = measureText(text)
  const left = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x

  return (
    <canvas
      ref={ref}
      className={className}
      aria-label={text}
      role="img"
      style={{ position: 'absolute', left: left, top: y, ...style }}
    />
  )
}
