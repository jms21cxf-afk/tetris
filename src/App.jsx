import { useTetris } from './tetris/useTetris'
import { useIsMobile } from './hooks/useIsMobile'
import Board from './components/Board'
import NextPiece from './components/NextPiece'
import GameInfo from './components/GameInfo'
import Controls from './components/Controls'
import TouchControls from './components/TouchControls'
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
  } = useTetris()

  const handleStart = () => {
    initAudio()
    startGame()
  }

  const showTouchControls = isPlaying && !gameOver

  return (
    <div className="app">
      <h1 className="title">TETRIS</h1>

      {isMobile && isPlaying && (
        <div className="mobile-header">
          <GameInfo score={score} level={level} lines={lines} />
          <NextPiece piece={nextPiece} compact />
        </div>
      )}

      <div className="game-container">
        {!isMobile && (
          <aside className="sidebar left">
            <GameInfo score={score} level={level} lines={lines} />
          </aside>
        )}

        <main className="game-board-wrapper">
          <Board
            board={board}
            currentPiece={currentPiece}
            ghostPosition={ghostPosition}
          />

          {!isPlaying && !gameOver && (
            <div className="overlay menu">
              <p className="overlay-text menu-text">TETRIS</p>
              <button type="button" className="start-btn" onClick={handleStart}>
                시작하기
              </button>
            </div>
          )}

          {gameOver && (
            <div className="overlay">
              <p className="overlay-text">GAME OVER</p>
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
