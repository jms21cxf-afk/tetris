import { useState, useCallback, useEffect, useRef } from 'react'
import { KEY_BINDINGS, LEVEL7_DANCE_DURATION_MS } from './constants'
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
  applyLevelUpBoardEffects,
  spawnMidPiece,
  hasMidSpawn,
  getMidSpawnDelay,
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
  const flashTimerRef = useRef(null)
  const levelFlashTimerRef = useRef(null)
  const midSpawnTimerRef = useRef(null)
  const danceTimerRef = useRef(null)
  const [flashEvent, setFlashEvent] = useState(null)
  const [danceEvent, setDanceEvent] = useState(null)

  const showFlash = useCallback((event) => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current)
    }
    setFlashEvent(event ? { ...event, id: Date.now() } : null)
    if (!event) return
    flashTimerRef.current = setTimeout(() => {
      setFlashEvent(null)
      flashTimerRef.current = null
    }, 1600)
  }, [])

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
      if (levelFlashTimerRef.current) clearTimeout(levelFlashTimerRef.current)
      if (midSpawnTimerRef.current) clearTimeout(midSpawnTimerRef.current)
      if (danceTimerRef.current) clearTimeout(danceTimerRef.current)
    }
  }, [])

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
    if (linesCleared === 4) {
      sounds.tetrisClear()
      showFlash({ kind: 'tetris' })
    } else if (linesCleared > 0) {
      sounds.lineClear(linesCleared)
    }

    let nextState = { ...state, board, currentPiece: null }

    if (linesCleared > 0) {
      const prevLevel = state.level
      nextState = applyLineClear(nextState, linesCleared)
      const isLevel7To8 = prevLevel === 7 && nextState.level === 8

      if (nextState.level > prevLevel && !isLevel7To8) {
        nextState = applyLevelUpBoardEffects(nextState, prevLevel, nextState.level)
      }

      // 레벨 7→8: 5줄 달성 시 춤 연출 후 보드 리셋·레벨8
      if (isLevel7To8) {
        nextState = { ...nextState, isCelebrating: true, currentPiece: null }
        return nextState
      }

      // 레벨 업 연출은 줄 클리어 직후에 띄움(useEffect보다 모바일에서 안정적)
      if (nextState.level > prevLevel) {
        sounds.levelUp()
        const newLevel = nextState.level
        if (linesCleared === 4) {
          if (levelFlashTimerRef.current) clearTimeout(levelFlashTimerRef.current)
          levelFlashTimerRef.current = setTimeout(() => {
            showFlash({ kind: 'level', level: newLevel })
            levelFlashTimerRef.current = null
          }, 1650)
        } else {
          showFlash({ kind: 'level', level: newLevel })
        }
      }
    }

    nextState = spawnNextPiece(nextState)
    return nextState
  }, [showFlash])

  const tick = useCallback(() => {
    setGameState((prev) => {
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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
      if (
        !prev.isPlaying ||
        prev.isPaused ||
        prev.gameOver ||
        prev.isCelebrating ||
        !prev.currentPiece
      ) {
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

    if (danceTimerRef.current) {
      clearTimeout(danceTimerRef.current)
      danceTimerRef.current = null
    }
    setDanceEvent(null)
    prevGameOverRef.current = false
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
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return
      }

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
    if (!gameState.isCelebrating) return

    setDanceEvent({ id: Date.now() })
    sounds.level7Dance()

    danceTimerRef.current = setTimeout(() => {
      setGameState((prev) => {
        if (!prev.isCelebrating) return prev
        let next = applyLevelUpBoardEffects(prev, 7, 8)
        next = spawnNextPiece({ ...next, isCelebrating: false })
        return next
      })
      sounds.levelUp()
      showFlash({ kind: 'level', level: 8 })
      setDanceEvent(null)
      danceTimerRef.current = null
    }, LEVEL7_DANCE_DURATION_MS)

    return () => {
      if (danceTimerRef.current) {
        clearTimeout(danceTimerRef.current)
        danceTimerRef.current = null
      }
    }
  }, [gameState.isCelebrating, showFlash])

  useEffect(() => {
    const { level, isPlaying, isPaused, gameOver, isCelebrating } = gameState

    if (!hasMidSpawn(level) || !isPlaying || isPaused || gameOver || isCelebrating) {
      if (midSpawnTimerRef.current) {
        clearTimeout(midSpawnTimerRef.current)
        midSpawnTimerRef.current = null
      }
      return
    }

    let cancelled = false

    const scheduleNext = () => {
      if (cancelled) return

      const current = gameStateRef.current
      if (
        !hasMidSpawn(current.level) ||
        !current.isPlaying ||
        current.isPaused ||
        current.gameOver ||
        current.isCelebrating
      ) {
        return
      }

      if (midSpawnTimerRef.current) {
        clearTimeout(midSpawnTimerRef.current)
        midSpawnTimerRef.current = null
      }

      const { min, max } = getMidSpawnDelay(current.level)
      const delay = min + Math.random() * (max - min)

      midSpawnTimerRef.current = setTimeout(() => {
        midSpawnTimerRef.current = null
        if (cancelled) return

        setGameState((prev) => spawnMidPiece(prev))
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      cancelled = true
      if (midSpawnTimerRef.current) {
        clearTimeout(midSpawnTimerRef.current)
        midSpawnTimerRef.current = null
      }
    }
  }, [gameState.level, gameState.isPlaying, gameState.isPaused, gameState.gameOver, gameState.isCelebrating])

  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver || gameState.isCelebrating) {
      return
    }

    const interval = setInterval(tick, getDropInterval(gameState.level))
    return () => clearInterval(interval)
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, gameState.isCelebrating, gameState.level, tick])

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
    flashEvent,
    danceEvent,
  }
}
