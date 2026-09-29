const BASE = '/audios'

type Bank = Record<string, string[]>

const banks: Record<string, Bank> = {
  ambient: {
    desk: ['booth-ambient.wav'],
    border: ['border-ambient.wav'],
  },
  intro: {
    start: ['booth-intro.wav'],
    shutter: ['shutter-rise.wav'],
    curtain: ['curtain-open.wav'],
  },
  drift: {
    truck: ['car-driveby.wav'],
    motor: ['motorbike-rev.wav'],
  },
  paper: {
    grab: ['paper-dragstart0.wav', 'paper-dragstart1.wav', 'paper-dragstart2.wav'],
    release: ['paper-dragstop0.wav', 'paper-dragstop1.wav', 'paper-dragstop2.wav'],
    drop: ['paper-spit.wav'],
    turn: ['paper-turnpage0.wav', 'paper-turnpage1.wav', 'paper-turnpage2.wav'],
  },
  metal: {
    grab: ['metal-dragstart0.wav', 'metal-dragstart1.wav', 'metal-dragstart2.wav'],
    release: ['metal-dragstop0.wav', 'metal-dragstop1.wav', 'metal-dragstop2.wav'],
    drop: ['metal-drop.wav'],
    heavy: ['heavy-drop.wav'],
  },
  stamp: {
    down: ['stamp-down.wav'],
    up: ['stamp-up.wav'],
  },
  button: {
    down: ['button-down.wav'],
    up: ['button-up.wav'],
  },
  inspect: {
    open: ['inspect-open.wav'],
    close: ['inspect-close.wav'],
    highlight: ['inspect-highlight.wav'],
    unhighlight: ['inspect-unhighlight.wav'],
    on: ['inspect-interrogateon.wav'],
    diagram: ['inspect-diagramon.wav'],
  },
  filer: {
    open: ['filer-open.wav'],
    close: ['filer-close.wav'],
  },
  text: {
    reveal: ['text-reveal0.wav', 'text-reveal1.wav', 'text-reveal2.wav', 'text-reveal3.wav'],
  },
  speech: {
    entrant: ['speech-entrant.wav'],
    inspector: ['speech-inspector.wav'],
    announce: ['speech-announce.wav'],
  },
  misc: {
    flash: ['camera-flash.wav'],
    shred: ['printer-tear.wav'],
    print: ['printer-feed.wav'],
    end: ['time-up.wav'],
  },
}

const poolCache = new Map<string, HTMLAudioElement[]>()

let unlocked = false
let muted = false
const lastPlayed = new Map<string, number>()

function pool(group: string, name: string): HTMLAudioElement[] {
  const key = `${group}.${name}`
  const cached = poolCache.get(key)
  if (cached) return cached

  const files = banks[group]?.[name] ?? []
  const items = files.map((file) => {
    const audio = new Audio(`${BASE}/${file}`)
    audio.preload = 'auto'
    return audio
  })
  poolCache.set(key, items)
  return items
}

let loopInstance: HTMLAudioElement | null = null
let loopName = ''

export function setMuted(value: boolean) {
  muted = value
  if (muted) {
    stopLoop()
  } else {
    unlocked = true
  }
}

export function isMuted() {
  return muted
}

export function unlockAudio() {
  unlocked = true
  if (!muted && loopName === 'ambient.desk') {
    startLoop('ambient.desk')
  }
}

export function play(group: string, name: string, options?: { volume?: number; throttle?: number }) {
  if (muted || !unlocked) return
  const items = pool(group, name)
  if (items.length === 0) return

  const key = `${group}.${name}`
  if (options?.throttle) {
    const now = performance.now()
    const previous = lastPlayed.get(key) ?? -Infinity
    if (now - previous < options.throttle) return
    lastPlayed.set(key, now)
  }

  const audio = items[Math.floor(Math.random() * items.length)]
  audio.volume = options?.volume ?? 0.5
  audio.currentTime = 0
  audio.play().catch(() => undefined)
}

export function startLoop(name: string, volume = 0.28) {
  if (muted) return
  if (loopName === name && loopInstance && !loopInstance.paused) return

  const [group, variant] = name.split('.')
  const items = pool(group, variant)
  if (items.length === 0) return

  stopLoop()
  const audio = items[0]
  audio.volume = volume
  audio.loop = true
  loopInstance = audio
  loopName = name
  if (unlocked) {
    audio.play().catch(() => undefined)
  } else {
    audio.addEventListener('canplay', () => {
      if (!muted && loopInstance === audio) audio.play().catch(() => undefined)
    }, { once: true })
  }
}

export function stopLoop() {
  if (loopInstance) {
    loopInstance.pause()
    loopInstance.currentTime = 0
  }
  loopInstance = null
  loopName = ''
}

export function setLoopVolume(value: number) {
  if (loopInstance) loopInstance.volume = value
}
