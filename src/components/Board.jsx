import { buildDisplayBoard } from '../tetris/board'
import Cell from './Cell'

export default function Board({ board, currentPiece, ghostPosition }) {
  const displayBoard = buildDisplayBoard(board, currentPiece, ghostPosition)

  return (
    <div className="board">
      {displayBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} value={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}
