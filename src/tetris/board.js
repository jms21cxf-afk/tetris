import { BOARD_WIDTH, BOARD_HEIGHT, EMPTY } from './constants'
import { PIECE_TYPES } from './tetrominoes'

export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(EMPTY),
  )
}

/** 바닥(맨 아래 줄) 빈 칸 중 하나에 랜덤 색 1칸 배치 */
export function placeRandomBottomMino(board) {
  const newBoard = board.map((row) => [...row])
  const row = BOARD_HEIGHT - 1
  const emptyCols = []

  for (let col = 0; col < BOARD_WIDTH; col++) {
    if (newBoard[row][col] === EMPTY) emptyCols.push(col)
  }

  if (emptyCols.length === 0) return newBoard

  const col = emptyCols[Math.floor(Math.random() * emptyCols.length)]
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  newBoard[row][col] = type
  return newBoard
}

export function isValidPosition(board, shape, position) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue

      const boardRow = position.row + row
      const boardCol = position.col + col

      if (boardCol < 0 || boardCol >= BOARD_WIDTH || boardRow >= BOARD_HEIGHT) {
        return false
      }

      if (boardRow >= 0 && board[boardRow][boardCol] !== EMPTY) {
        return false
      }
    }
  }
  return true
}

export function mergePiece(board, piece) {
  const newBoard = board.map((row) => [...row])
  const { shape, position, type } = piece

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue

      const boardRow = position.row + row
      const boardCol = position.col + col

      if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0) {
        newBoard[boardRow][boardCol] = type
      }
    }
  }

  return newBoard
}

export function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === EMPTY))
  const linesCleared = BOARD_HEIGHT - remaining.length

  while (remaining.length < BOARD_HEIGHT) {
    remaining.unshift(Array(BOARD_WIDTH).fill(EMPTY))
  }

  return { board: remaining, linesCleared }
}

export function getGhostPosition(board, piece) {
  let ghostPosition = { ...piece.position }

  while (
    isValidPosition(board, piece.shape, {
      row: ghostPosition.row + 1,
      col: ghostPosition.col,
    })
  ) {
    ghostPosition = { row: ghostPosition.row + 1, col: ghostPosition.col }
  }

  return ghostPosition
}

export function buildDisplayBoard(board, currentPiece, ghostPosition) {
  const display = board.map((row) => [...row])

  if (currentPiece && ghostPosition) {
    const { shape, type } = currentPiece
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue
        const r = ghostPosition.row + row
        const c = ghostPosition.col + col
        if (r >= 0 && r < BOARD_HEIGHT && c >= 0 && display[r][c] === EMPTY) {
          display[r][c] = `ghost-${type}`
        }
      }
    }
  }

  if (currentPiece) {
    const { shape, position, type } = currentPiece
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue
        const r = position.row + row
        const c = position.col + col
        if (r >= 0 && r < BOARD_HEIGHT && c >= 0) {
          display[r][c] = type
        }
      }
    }
  }

  return display
}
