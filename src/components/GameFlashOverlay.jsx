/** 레벨 업 / 4줄(테트리스) 짧은 연출 */
export default function GameFlashOverlay({ event, fullscreen = false }) {
  if (!event) return null

  const rootClass = `game-flash${fullscreen ? ' game-flash-fullscreen' : ''}`

  if (event.kind === 'level') {
    return (
      <div
        key={event.id}
        className={`${rootClass} game-flash-level`}
        aria-live="polite"
      >
        <p className="game-flash-title">LEVEL {event.level}!</p>
        <p className="game-flash-sub">단계 UP · 더 빨라져요</p>
      </div>
    )
  }

  return (
    <div
      key={event.id}
      className={`${rootClass} game-flash-tetris`}
      aria-live="polite"
    >
      <p className="game-flash-title">TETRIS!</p>
      <p className="game-flash-sub">4줄 한 방!</p>
    </div>
  )
}
