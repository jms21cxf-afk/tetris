export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export const EMPTY = 0

/** 레벨 6 바닥(땅) 블록 */
export const GROUND_CELL = 'G'

export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
  G: '#6e4a34',
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

/** 레벨 4부터 바닥에 랜덤 블록 1개 쌓임 */
export const GARBAGE_MINO_FROM_LEVEL = 4

/** 레벨 5~8: 무작위 시간에 위에서 떨어지는 테트로미노 1개 추가 */
export const MID_SPAWN_FROM_LEVEL = 5
export const MID_SPAWN_TO_LEVEL = 8
export const MID_SPAWN_MIN_DELAY_MS = 20000
export const MID_SPAWN_MAX_DELAY_MS = 30000
export const MID_SPAWN_LEVEL7_MIN_DELAY_MS = 40000
export const MID_SPAWN_LEVEL7_MAX_DELAY_MS = 50000
export const MID_SPAWN_LEVEL8_MIN_DELAY_MS = 30000
export const MID_SPAWN_LEVEL8_MAX_DELAY_MS = 40000

/** 레벨 6+: 바닥 땅 줄 수 (6=1줄, 7=2줄, 8=3줄) */
export const RAISED_GROUND_FROM_LEVEL = 6
export const RAISED_GROUND_ROWS_BY_LEVEL = {
  6: 1,
  7: 2,
  8: 3,
}

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
