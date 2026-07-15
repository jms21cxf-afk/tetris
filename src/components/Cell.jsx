import { COLORS } from '../tetris/constants'

function getCellColor(cell) {
  if (!cell || cell === 0) return null
  if (typeof cell === 'string' && cell.startsWith('ghost-')) {
    const type = cell.replace('ghost-', '')
    return { background: COLORS[type], opacity: 0.25, isGhost: true }
  }
  return { background: COLORS[cell], opacity: 1, isGhost: false }
}

export default function Cell({ value }) {
  const color = getCellColor(value)

  return (
    <div
      className={`cell${color ? ' filled' : ''}${color?.isGhost ? ' ghost' : ''}`}
      style={
        color
          ? { backgroundColor: color.background, opacity: color.opacity }
          : undefined
      }
    />
  )
}
