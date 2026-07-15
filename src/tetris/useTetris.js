import { useState, useCallback, useEffect, useRef } from 'react'
import { KEY_BINDINGS } from './constants'
import { getGhostPosition } from './board'
import { initAudio, sounds, toggleMuted, setMuted } from './sounds'
import { loadHighScore, saveHighScore, loadMuted } from './storage'
import {
  createMenuState,
  beginGame,
  tryMove,
  tryRotate,
  hardDrop,
  lockPiece,
  spawnNextPiece,
  applyLineClear,
  getDropInterval,
} from './gameLogic'

export function useTetris({ onScoreRecord } = {}) {
  const initialHighScore = loadHighScore()
  const [gameState, setGameState] = useState(createMenuState)
  const [highScore, setHighScore] = useState(initialHighScore)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [muted, setMutedState] = useState(() => loadMuted())
  const gameStateRef = useRef(gameState)
  const highScoreRef = useRef(initialHighScore)
  const beatRecordThisGameRef = useRef(false)
  const onScoreRecordRef = useRef(onScoreRecord)
  const prevGameOverRef = useRef(false)
  const prevLevelRef = useRef(1)

  useEffect(() => {
    onScoreRecordRef.current = onScoreRecord
  }, [onScoreRecord])

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  const saveIfBest = useCallback((score) => {
    if (score <= 0 || score <= highScoreRef.current) {
      return false
    }

    highScoreRef.current = score
    setHighScore(score)
    saveHighScore(score)
    beatRecordThisGameRef.current = true
    return true
  }, [])

  const lockAndSpawn = useCallback((state, piece) => {
    const { board, linesCleared } = lockPiece(state.board, piece)
    sounds.lock()
    if (linesCleared > 0) {
      sounds.lineClear(linesCleared)
    }

    let nextState = { ...state, board, currentPiece: null }

    if (linesCleared > 0) {
      nextState = applyLineClear(nextState, linesCleared)
    }

    nextState = spawnNextPiece(nextState)
    return nextState
  }, [])

  const tick = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }

      const moved = tryMove(prev.board, prev.currentPiece, 1, 0)
      if (moved) {
        return { ...prev, currentPiece: moved }
      }

      return lockAndSpawn(prev, prev.currentPiece)
    })
  }, [lockAndSpawn])

  const moveLeft = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }
      const moved = tryMove(prev.board, prev.currentPiece, 0, -1)
      if (moved) {
        sounds.move()
        return { ...prev, currentPiece: moved }
      }
      return prev
    })
  }, [])

  const moveRight = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }
      const moved = tryMove(prev.board, prev.currentPiece, 0, 1)
      if (moved) {
        sounds.move()
        return { ...prev, currentPiece: moved }
      }
      return prev
    })
  }, [])

  const softDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }

      const moved = tryMove(prev.board, prev.currentPiece, 1, 0)
      if (moved) {
        sounds.softDrop()
        return { ...prev, currentPiece: moved, score: prev.score + 1 }
      }

      return lockAndSpawn(prev, prev.currentPiece)
    })
  }, [lockAndSpawn])

  const rotate = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }
      const rotated = tryRotate(prev.board, prev.currentPiece)
      if (rotated) {
        sounds.rotate()
        return { ...prev, currentPiece: rotated }
      }
      return prev
    })
  }, [])

  const dropHard = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.gameOver || !prev.currentPiece) {
        return prev
      }

      sounds.hardDrop()
      const dropped = hardDrop(prev.board, prev.currentPiece)
      const dropDistance = dropped.position.row - prev.currentPiece.position.row
      const withScore = {
        ...prev,
        score: prev.score + dropDistance * 2,
      }

      return lockAndSpawn(withScore, dropped)
    })
  }, [lockAndSpawn])

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.gameOver) return prev
      return { ...prev, isPaused: !prev.isPaused }
    })
  }, [])

  const toggleMute = useCallback(() => {
    initAudio()
    setMutedState(toggleMuted())
  }, [])

  const startGame = useCallback(() => {
    initAudio()
    prevGameOverRef.current = false
    prevLevelRef.current = 1
    beatRecordThisGameRef.current = false
    setIsNewRecord(false)
    setGameState(beginGame())
  }, [])

  const flushGlobalScore = useCallback((score) => {
    if (beatRecordThisGameRef.current && score > 0) {
      onScoreRecordRef.current?.(score)
      beatRecordThisGameRef.current = false
    }
  }, [])

  const quitGame = useCallback(() => {
    const { score, isPlaying, gameOver } = gameStateRef.current
    if (isPlaying && !gameOver) {
      saveIfBest(score)
      flushGlobalScore(score)
    }

    prevGameOverRef.current = false
    prevLevelRef.current = 1
    setIsNewRecord(false)
    setGameState(createMenuState())
  }, [saveIfBest, flushGlobalScore])

  const actions = useRef({
    moveLeft,
    moveRight,
    softDrop,
    rotate,
    hardDrop: dropHard,
    togglePause,
    toggleMute,
  })

  useEffect(() => {
    actions.current = {
      moveLeft,
      moveRight,
      softDrop,
      rotate,
      hardDrop: dropHard,
      togglePause,
      toggleMute,
    }
  }, [moveLeft, moveRight, softDrop, rotate, dropHard, togglePause, toggleMute])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const action = KEY_BINDINGS[event.key]
      if (!action) return

      event.preventDefault()
      initAudio()
      actions.current[action]?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      return
    }

    const interval = setInterval(tick, getDropInterval(gameState.level))
    return () => clearInterval(interval)
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, gameState.level, tick])

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && gameState.score > highScoreRef.current) {
      saveIfBest(gameState.score)
    }
  }, [gameState.score, gameState.isPlaying, gameState.gameOver, saveIfBest])

  useEffect(() => {
    if (gameState.gameOver && !prevGameOverRef.current) {
      saveIfBest(gameState.score)

      if (beatRecordThisGameRef.current) {
        setIsNewRecord(true)
        sounds.celebrate()
        flushGlobalScore(gameState.score)
      } else {
        sounds.gameOver()
      }
    }
    prevGameOverRef.current = gameState.gameOver
  }, [gameState.gameOver, gameState.score, saveIfBest, flushGlobalScore])

  useEffect(() => {
    if (gameState.level > prevLevelRef.current && gameState.isPlaying) {
      sounds.levelUp()
    }
    prevLevelRef.current = gameState.level
  }, [gameState.level, gameState.isPlaying])

  const ghostPosition =
    gameState.currentPiece && !gameState.gameOver
      ? getGhostPosition(gameState.board, gameState.currentPiece)
      : null

  return {
    ...gameState,
    ghostPosition,
    highScore,
    isNewRecord,
    muted,
    moveLeft,
    moveRight,
    softDrop,
    rotate,
    hardDrop: dropHard,
    togglePause,
    toggleMute,
    startGame,
    quitGame,
  }
}
