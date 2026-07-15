import { formatHighScore } from '../tetris/formatScore'

export default function GameInfo({
  score,
  level,
  lines,
  highScore = 0,
  compact = false,
  menuOnly = false,
  showHighScore = true,
}) {
  if (menuOnly) {
    return (
      <div className="game-info menu-only">
        <div className="stat">
          <span className="stat-label">최고기록</span>
          <span className={`stat-value${highScore > 0 ? ' high-score' : ''}`}>
            {formatHighScore(highScore)}
          </span>
        </div>
      </div>
    )
  }

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
        {showHighScore && (
          <div className="stat-inline best-stat">
            <span className="stat-label">최고</span>
            <span className="stat-value high-score">{formatHighScore(highScore)}</span>
          </div>
        )}
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
      <div className="stat">
        <span className="stat-label">최고기록</span>
        <span className={`stat-value${highScore > 0 ? ' high-score' : ''}`}>
          {formatHighScore(highScore)}
        </span>
      </div>
    </div>
  )
}
