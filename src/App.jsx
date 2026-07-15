import { useTetris } from './tetris/useTetris'
import { useIsMobile } from './hooks/useIsMobile'
import { formatHighScore } from './tetris/formatScore'
import Board from './components/Board'
import NextPiece from './components/NextPiece'
import GameInfo from './components/GameInfo'
import Controls from './components/Controls'
import TouchControls from './components/TouchControls'
import MuteButton from './components/MuteButton'
import Fireworks from './components/Fireworks'
import { initAudio } from './tetris/sounds'
import './App.css'

function App() {
  const isMobile = useIsMobile()
  const {
    board,
    currentPiece,
    nextPiece,
    ghostPosition,
    score,
    level,
    lines,
    highScore,
    isNewRecord,
    muted,
    gameOver,
    isPaused,
    isPlaying,
    startGame,
    quitGame,
    moveLeft,
    moveRight,
    softDrop,
    rotate,
    hardDrop,
    togglePause,
    toggleMute,
  } = useTetris()

  const isMenu = !isPlaying && !gameOver

  const handleStart = () => {
    initAudio()
    startGame()
  }

  const handleToggleMute = () => {
    initAudio()
    toggleMute()
  }

  const showTouchControls = isPlaying && !gameOver

  return (
    <div
      className={`app${isMobile ? ' mobile' : ''}${isMobile && isPlaying ? ' playing' : ''}`}
    >
      <MuteButton muted={muted} onToggle={handleToggleMute} />

      {gameOver && isNewRecord && <Fireworks active />}

      {(!isMobile || !isPlaying) && <h1 className="title">TETRIS</h1>}

      {isMobile && isMenu && (
        <p className="mobile-high-score">최고기록 {formatHighScore(highScore)}</p>
      )}

      {isMobile && isPlaying && (
        <div className="mobile-header">
          <div className="mobile-stats-block">
            <GameInfo
              score={score}
              level={level}
              lines={lines}
              highScore={highScore}
              compact
              showHighScore={false}
            />
            <p className="mobile-best-line">최고기록 {formatHighScore(highScore)}</p>
          </div>
          <NextPiece piece={nextPiece} compact />
        </div>
      )}

      <div className="game-container">
        {!isMobile && (
          <aside className="sidebar left">
            <GameInfo
              score={score}
              level={level}
              lines={lines}
              highScore={highScore}
              menuOnly={isMenu}
            />
          </aside>
        )}

        <main className="game-board-wrapper">
          <Board
            board={board}
            currentPiece={currentPiece}
            ghostPosition={ghostPosition}
          />

          {isMenu && (
            <div className="overlay menu">
              <p className="overlay-text menu-text">TETRIS</p>
              <p className="overlay-subtext menu-high-score">
                최고기록 {formatHighScore(highScore)}
              </p>
              <button type="button" className="start-btn" onClick={handleStart}>
                시작하기
              </button>
            </div>
          )}

          {gameOver && (
            <div className={`overlay${isNewRecord ? ' record' : ''}`}>
              {isNewRecord ? (
                <>
                  <p className="overlay-text record-title">🎉 NEW RECORD!</p>
                  <p className="overlay-record-msg">축하합니다! 최고기록을 경신했어요!</p>
                  <p className="overlay-subtext record-score">
                    {score.toLocaleString()}점
                  </p>
                </>
              ) : (
                <>
                  <p className="overlay-text">GAME OVER</p>
                  <p className="overlay-subtext">점수 {score.toLocaleString()}</p>
                  <p className="overlay-subtext">최고기록 {formatHighScore(highScore)}</p>
                </>
              )}
              <div className="overlay-actions">
                <button type="button" className="start-btn" onClick={handleStart}>
                  다시 시작
                </button>
                <button type="button" className="secondary-btn" onClick={quitGame}>
                  나가기
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="overlay pause">
              <p className="overlay-text">PAUSED</p>
              <div className="overlay-actions">
                <button type="button" className="start-btn" onClick={togglePause}>
                  계속하기
                </button>
                <button type="button" className="secondary-btn" onClick={quitGame}>
                  나가기
                </button>
              </div>
            </div>
          )}
        </main>

        {!isMobile && (
          <aside className="sidebar right">
            <NextPiece piece={nextPiece} />
            <Controls
              onStart={handleStart}
              onQuit={quitGame}
              isPlaying={isPlaying}
              gameOver={gameOver}
              isPaused={isPaused}
            />
          </aside>
        )}
      </div>

      {isMobile && showTouchControls && (
        <TouchControls
          moveLeft={moveLeft}
          moveRight={moveRight}
          softDrop={softDrop}
          rotate={rotate}
          hardDrop={hardDrop}
          togglePause={togglePause}
        />
      )}
    </div>
  )
}

export default App
