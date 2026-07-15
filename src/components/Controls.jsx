export default function Controls({
  onStart,
  onQuit,
  isPlaying,
  gameOver,
  isPaused,
}) {
  return (
    <div className="controls">
      <h3>조작법</h3>
      <ul>
        <li><kbd>←</kbd> <kbd>→</kbd> 이동</li>
        <li><kbd>↑</kbd> 회전</li>
        <li><kbd>↓</kbd> 소프트 드롭</li>
        <li><kbd>Space</kbd> 하드 드롭</li>
        <li><kbd>P</kbd> 일시정지</li>
        <li><kbd>M</kbd> 음소거</li>
      </ul>

      {!isPlaying && !gameOver && (
        <button type="button" className="start-btn" onClick={onStart}>
          시작하기
        </button>
      )}

      {isPlaying && !gameOver && (
        <button type="button" className="secondary-btn" onClick={onQuit}>
          나가기
        </button>
      )}

      {isPlaying && isPaused && (
        <p className="pause-msg">일시정지 중</p>
      )}
    </div>
  )
}
