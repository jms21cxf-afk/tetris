import { BOARD_WIDTH, BOARD_HEIGHT, EMPTY, GROUND_CELL } from './constants'
import { PIECE_TYPES, TETROMINOES } from './tetrominoes'

export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(EMPTY),
  )
}

function dropPieceToBottom(board, shape, col) {
  let row = -4
  while (isValidPosition(board, shape, { row: row + 1, col })) {
    row++
  }
  return row
}

function pieceHasVisibleCell(shape, position) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue
      const boardRow = position.row + row
      if (boardRow >= 0 && boardRow < BOARD_HEIGHT) return true
    }
  }
  return false
}

function collectValidPlacements(board) {
  const placements = []

  for (const type of PIECE_TYPES) {
    const { shapes } = TETROMINOES[type]
    for (let rotation = 0; rotation < shapes.length; rotation++) {
      const shape = shapes[rotation]
      for (let col = -3; col < BOARD_WIDTH; col++) {
        const position = { row: dropPieceToBottom(board, shape, col), col }
        if (!isValidPosition(board, shape, position)) continue
        if (!pieceHasVisibleCell(shape, position)) continue
        placements.push({ type, shape, position })
      }
    }
  }

  return placements
}

function pickRandomPlacement(placements) {
  return placements[Math.floor(Math.random() * placements.length)]
}

/** 맨 아래 N줄을 땅처럼 채움 */
export function applyRaisedGround(board, rows = 1) {
  const newBoard = board.map((row) => [...row])

  for (let i = 0; i < rows; i++) {
    const row = BOARD_HEIGHT - 1 - i
    for (let col = 0; col < BOARD_WIDTH; col++) {
      newBoard[row][col] = GROUND_CELL
    }
  }

  return newBoard
}

/** 바닥에 랜덤 테트로미노 1개를 위에서 떨어뜨린 것처럼 배치 */
export function placeRandomBottomMino(board) {
  const placements = collectValidPlacements(board)
  if (placements.length === 0) return board.map((row) => [...row])

  const pick = pickRandomPlacement(placements)
  return mergePiece(board, pick)
}

/** 플레이 영역(빈 칸) 중 무작위 위치에 1×1 블록 1개 배치 */
export function placeRandomSingleMino(board) {
  const emptyCells = []

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      if (board[row][col] === EMPTY) {
        emptyCells.push({ row, col })
      }
    }
  }

  if (emptyCells.length === 0) {
    return board.map((row) => [...row])
  }

  const { row, col } =
    emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  const newBoard = board.map((r) => [...r])
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

function isGroundRow(row) {
  return row.every((cell) => cell === GROUND_CELL)
}

export function clearLines(board) {
  const remaining = board.filter(
    (row) => row.some((cell) => cell === EMPTY) || isGroundRow(row),
  )
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
