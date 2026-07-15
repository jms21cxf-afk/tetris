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

export const LINES_PER_LEVEL = 10
export const BASE_DROP_INTERVAL = 1000

export const KEY_BINDINGS = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'softDrop',
  ArrowUp: 'rotate',
  ' ': 'hardDrop',
  p: 'togglePause',
  P: 'togglePause',
}
