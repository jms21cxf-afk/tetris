import {
  BOARD_WIDTH,
  SCORE_TABLE,
  LINES_PER_LEVEL,
  BASE_DROP_INTERVAL,
  GARBAGE_MINO_FROM_LEVEL,
  MID_SPAWN_FROM_LEVEL,
  MID_SPAWN_TO_LEVEL,
  MID_SPAWN_MIN_DELAY_MS,
  MID_SPAWN_MAX_DELAY_MS,
  MID_SPAWN_LEVEL7_MIN_DELAY_MS,
  MID_SPAWN_LEVEL7_MAX_DELAY_MS,
  MID_SPAWN_LEVEL8_MIN_DELAY_MS,
  MID_SPAWN_LEVEL8_MAX_DELAY_MS,
  RAISED_GROUND_FROM_LEVEL,
  RAISED_GROUND_ROWS_BY_LEVEL,
  DEV_START_LEVEL,
} from './constants'
import { TETROMINOES, PIECE_TYPES } from './tetrominoes'
import {
  createEmptyBoard,
  isValidPosition,
  mergePiece,
  clearLines,
  placeRandomBottomMino,
  applyRaisedGround,
} from './board'

export function hasMidSpawn(level) {
  return level >= MID_SPAWN_FROM_LEVEL && level <= MID_SPAWN_TO_LEVEL
}

export function getMidSpawnDelay(level) {
  if (level >= 8) {
    return {
      min: MID_SPAWN_LEVEL8_MIN_DELAY_MS,
      max: MID_SPAWN_LEVEL8_MAX_DELAY_MS,
    }
  }
  if (level >= 7) {
    return {
      min: MID_SPAWN_LEVEL7_MIN_DELAY_MS,
      max: MID_SPAWN_LEVEL7_MAX_DELAY_MS,
    }
  }
  return {
    min: MID_SPAWN_MIN_DELAY_MS,
    max: MID_SPAWN_MAX_DELAY_MS,
  }
}

export function getRaisedGroundRows(level) {
  if (level >= 8) return RAISED_GROUND_ROWS_BY_LEVEL[8]
  if (level >= 7) return RAISED_GROUND_ROWS_BY_LEVEL[7]
  if (level >= RAISED_GROUND_FROM_LEVEL) return RAISED_GROUND_ROWS_BY_LEVEL[6]
  return 0
}

function resolveDevStartLevel() {
  if (!import.meta.env.DEV) return 0
  const fromUrl = new URLSearchParams(window.location.search).get('devLevel')
  if (fromUrl != null && fromUrl !== '') {
    const n = Number(fromUrl)
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 0
  }
  return DEV_START_LEVEL > 0 ? Math.floor(DEV_START_LEVEL) : 0
}

export function randomPieceType() {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

export function createPiece(type) {
  const tetromino = TETROMINOES[type]
  return {
    type,
    rotation: 0,
    shape: tetromino.shapes[0],
    position: { row: -1, col: Math.floor(BOARD_WIDTH / 2) - 2 },
  }
}

export function rotatePiece(piece, direction = 1) {
  const shapes = TETROMINOES[piece.type].shapes
  const shapeCount = shapes.length
  const newRotation = (piece.rotation + direction + shapeCount) % shapeCount

  return {
    ...piece,
    rotation: newRotation,
    shape: shapes[newRotation],
  }
}

export function movePiece(piece, deltaRow, deltaCol) {
  return {
    ...piece,
    position: {
      row: piece.position.row + deltaRow,
      col: piece.position.col + deltaCol,
    },
  }
}

export function tryMove(board, piece, deltaRow, deltaCol) {
  const moved = movePiece(piece, deltaRow, deltaCol)
  if (isValidPosition(board, moved.shape, moved.position)) {
    return moved
  }
  return null
}

export function tryRotate(board, piece, direction = 1) {
  const rotated = rotatePiece(piece, direction)

  // 벽 킥: 회전 실패 시 좌우로 1칸씩 이동 시도
  const kicks = [0, -1, 1, -2, 2]
  for (const kick of kicks) {
    const kicked = {
      ...rotated,
      position: { ...rotated.position, col: rotated.position.col + kick },
    }
    if (isValidPosition(board, kicked.shape, kicked.position)) {
      return kicked
    }
  }

  return null
}

export function hardDrop(board, piece) {
  let dropped = piece
  while (true) {
    const next = tryMove(board, dropped, 1, 0)
    if (!next) break
    dropped = next
  }
  return dropped
}

export function lockPiece(board, piece) {
  const merged = mergePiece(board, piece)
  const { board: clearedBoard, linesCleared } = clearLines(merged)
  return { board: clearedBoard, linesCleared }
}

export function calculateScore(linesCleared, level) {
  if (linesCleared === 0) return 0
  return (SCORE_TABLE[linesCleared] || linesCleared * 100) * level
}

export function calculateLevel(totalLines) {
  return Math.floor(totalLines / LINES_PER_LEVEL) + 1
}

export function getDropInterval(level) {
  return Math.max(100, BASE_DROP_INTERVAL - (level - 1) * 80)
}

export function createMenuState() {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: createPiece(randomPieceType()),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    isPlaying: false,
  }
}

function applyLevelStartBoard(startLevel) {
  let board = createEmptyBoard()

  if (startLevel === GARBAGE_MINO_FROM_LEVEL) {
    board = placeRandomBottomMino(board)
  } else {
    const groundRows = getRaisedGroundRows(startLevel)
    if (groundRows > 0) {
      board = applyRaisedGround(board, groundRows)
    }
  }

  return { board }
}

export function beginGame() {
  const first = createPiece(randomPieceType())
  const next = createPiece(randomPieceType())
  const devLevel = resolveDevStartLevel()
  const startLevel = devLevel > 0 ? devLevel : 1
  const startLines = (startLevel - 1) * LINES_PER_LEVEL
  const { board } = applyLevelStartBoard(startLevel)

  return {
    board,
    currentPiece: first,
    nextPiece: next,
    score: 0,
    level: startLevel,
    lines: startLines,
    gameOver: false,
    isPaused: false,
    isPlaying: true,
  }
}

/** 레벨 4+ 진입 시 보드 초기화 (4: 바닥 블록, 5~8: 랜덤 스폰, 6~8: 땅 1~3줄) */
export function applyLevelUpBoardEffects(state, prevLevel, newLevel) {
  if (newLevel <= prevLevel || newLevel < GARBAGE_MINO_FROM_LEVEL) {
    return state
  }

  const { board } = applyLevelStartBoard(newLevel)
  return { ...state, board }
}

export function spawnMidPiece(state) {
  if (
    !hasMidSpawn(state.level) ||
    !state.isPlaying ||
    state.isPaused ||
    state.gameOver
  ) {
    return state
  }

  return {
    ...state,
    board: placeRandomBottomMino(state.board),
  }
}

export function spawnNextPiece(state) {
  const currentPiece = {
    ...state.nextPiece,
    position: { row: -1, col: Math.floor(BOARD_WIDTH / 2) - 2 },
  }
  const nextPiece = createPiece(randomPieceType())

  const gameOver = !isValidPosition(
    state.board,
    currentPiece.shape,
    currentPiece.position,
  )

  return {
    ...state,
    currentPiece,
    nextPiece,
    gameOver,
    isPlaying: !gameOver,
  }
}

export function applyLineClear(state, linesCleared) {
  const newLines = state.lines + linesCleared
  const newLevel = calculateLevel(newLines)
  const scoreGain = calculateScore(linesCleared, state.level)

  return {
    ...state,
    lines: newLines,
    level: newLevel,
    score: state.score + scoreGain,
  }
}
