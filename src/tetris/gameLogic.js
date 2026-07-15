import {
  BOARD_WIDTH,
  SCORE_TABLE,
  LINES_PER_LEVEL,
  BASE_DROP_INTERVAL,
} from './constants'
import { TETROMINOES, PIECE_TYPES } from './tetrominoes'
import {
  createEmptyBoard,
  isValidPosition,
  mergePiece,
  clearLines,
} from './board'

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

export function beginGame() {
  const first = createPiece(randomPieceType())
  const next = createPiece(randomPieceType())

  return {
    board: createEmptyBoard(),
    currentPiece: first,
    nextPiece: next,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    isPlaying: true,
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
