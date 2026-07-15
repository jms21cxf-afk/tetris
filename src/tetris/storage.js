const HIGH_SCORE_KEY = 'tetris-high-score'
const MUTE_KEY = 'tetris-muted'
const NICKNAME_KEY = 'tetris-nickname'

export function loadHighScore() {
  try {
    const value = localStorage.getItem(HIGH_SCORE_KEY)
    const score = Number(value)
    return Number.isFinite(score) && score >= 0 ? score : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // private mode 등 저장 불가 환경
  }
}

export function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, String(muted))
  } catch {
    // ignore
  }
}

export function loadNickname() {
  try {
    return localStorage.getItem(NICKNAME_KEY) || ''
  } catch {
    return ''
  }
}

export function saveNickname(nickname) {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname)
  } catch {
    // ignore
  }
}
