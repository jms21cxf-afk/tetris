export default function GameInfo({ score, level, lines, compact = false }) {
  if (compact) {
    return (
      <div className="game-info compact">
        <div className="stat-inline">
          <span className="stat-label">점수</span>
          <span className="stat-value">{score.toLocaleString()}</span>
        </div>
        <div className="stat-inline">
          <span className="stat-label">Lv</span>
          <span className="stat-value">{level}</span>
        </div>
        <div className="stat-inline">
          <span className="stat-label">줄</span>
          <span className="stat-value">{lines}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="game-info">
      <div className="stat">
        <span className="stat-label">점수</span>
        <span className="stat-value">{score.toLocaleString()}</span>
      </div>
      <div className="stat">
        <span className="stat-label">레벨</span>
        <span className="stat-value">{level}</span>
      </div>
      <div className="stat">
        <span className="stat-label">줄</span>
        <span className="stat-value">{lines}</span>
      </div>
    </div>
  )
}
