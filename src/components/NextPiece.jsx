import { TETROMINOES } from '../tetris/tetrominoes'
import Cell from './Cell'

export default function NextPiece({ piece, compact = false }) {
  if (!piece) return null

  const shape = TETROMINOES[piece.type].shapes[0]
  const displayShape = shape.map((row) =>
    row.map((cell) => (cell ? piece.type : 0)),
  )

  return (
    <div className={`next-piece${compact ? ' compact' : ''}`}>
      {!compact && <h3>다음</h3>}
      {compact && <span className="next-label">다음</span>}
      <div className="next-piece-grid">
        {displayShape.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <Cell key={`${rowIndex}-${colIndex}`} value={cell} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
