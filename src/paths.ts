const base = import.meta.env.BASE_URL

export const AUDIO_BASE = `${base}audios`
export const ASSET_BASE = `${base}assets`
export const EN_BASE = `${base}assets-english`
export const FONT_BASE = `${base}fonts`

export const PAPER_BASE = `${ASSET_BASE}/papers`
export const INTRO_BASE = `${EN_BASE}/intro-clean`
export const BORDER_BASE = `${EN_BASE}/border`
export const BITMAP_FONT = `${EN_BASE}/fonts/atarismall_u_regular_8.png`
export const FAVICON = `${base}favicon.svg`

export const asset = (file: string) => `${ASSET_BASE}/${file}`
export const en = (file: string) => `${EN_BASE}/${file}`
export const paper = (file: string) => `${PAPER_BASE}/${file}`
