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
