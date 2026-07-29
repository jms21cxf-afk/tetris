export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export const EMPTY = 0

export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
}

export const SCORE_TABLE = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
}

// 클래식(NES)은 10줄마다 레벨업. 시연·초보자는 5줄로 더 빨리 체감.
export const LINES_PER_LEVEL = 5
export const BASE_DROP_INTERVAL = 1000

/** 레벨 4부터 바닥에 랜덤 1칸 쌓임 */
export const GARBAGE_MINO_FROM_LEVEL = 4

/** 개발: npm run dev 후 ?devLevel=4 로 레벨 바로 시작 (배포 빌드에서는 무시) */
export const DEV_START_LEVEL = Number(import.meta.env.VITE_DEV_START_LEVEL) || 0

export const KEY_BINDINGS = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'softDrop',
  ArrowUp: 'rotate',
  ' ': 'hardDrop',
  p: 'togglePause',
  P: 'togglePause',
  m: 'toggleMute',
  M: 'toggleMute',
}
