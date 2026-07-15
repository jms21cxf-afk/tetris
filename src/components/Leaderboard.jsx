export default function Leaderboard({ scores, loading, unavailable, compact = false }) {
  return (
    <div className={`leaderboard${compact ? ' compact' : ''}`}>
      <h3>🌍 글로벌 TOP 10</h3>

      {unavailable && (
        <p className="leaderboard-msg">랭킹 서버 연결 대기 중</p>
      )}

      {!unavailable && loading && (
        <p className="leaderboard-msg">불러오는 중...</p>
      )}

      {!unavailable && !loading && scores.length === 0 && (
        <p className="leaderboard-msg">아직 기록이 없어요</p>
      )}

      {!unavailable && scores.length > 0 && (
        <ol className="leaderboard-list">
          {scores.map((entry, index) => (
            <li key={`${entry.nickname}-${entry.score}-${index}`}>
              <span className="rank">{index + 1}</span>
              <span className="name">{entry.nickname}</span>
              <span className="score">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
