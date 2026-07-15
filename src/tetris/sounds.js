import { loadMuted, saveMuted } from './storage'

let audioContext = null
let muted = loadMuted()

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function initAudio() {
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = value
  saveMuted(value)
}

export function toggleMuted() {
  setMuted(!muted)
  return muted
}

function playTone(frequency, duration, type = 'square', volume = 0.1, startTime = 0) {
  if (muted) return

  try {
    const ctx = getContext()
    const time = ctx.currentTime + startTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(volume, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + duration)
  } catch {
    // 오디오 미지원 환경 무시
  }
}

export const sounds = {
  move() {
    playTone(220, 0.04, 'square', 0.07)
  },

  rotate() {
    playTone(330, 0.05, 'square', 0.08)
  },

  softDrop() {
    playTone(180, 0.03, 'square', 0.06)
  },

  hardDrop() {
    playTone(90, 0.06, 'sawtooth', 0.1)
    playTone(60, 0.08, 'sawtooth', 0.08, 0.04)
  },

  lock() {
    playTone(120, 0.08, 'triangle', 0.1)
  },

  lineClear(lines) {
    const notes = [262, 330, 392, 523]
    const count = Math.min(lines, 4)
    for (let i = 0; i < count; i++) {
      playTone(notes[i], 0.12, 'square', 0.09, i * 0.1)
    }
    if (lines === 4) {
      playTone(659, 0.2, 'square', 0.1, 0.4)
    }
  },

  levelUp() {
    playTone(440, 0.1, 'square', 0.08)
    playTone(554, 0.1, 'square', 0.08, 0.1)
    playTone(659, 0.15, 'square', 0.08, 0.2)
  },

  gameOver() {
    playTone(220, 0.15, 'triangle', 0.1)
    playTone(165, 0.15, 'triangle', 0.1, 0.15)
    playTone(110, 0.3, 'triangle', 0.1, 0.3)
  },

  celebrate() {
    const notes = [523, 659, 784, 988, 1175]
    notes.forEach((note, i) => {
      playTone(note, 0.18, 'square', 0.09, i * 0.12)
    })
  },
}
