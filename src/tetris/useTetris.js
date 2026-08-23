import { useState, useCallback, useEffect, useRef } from 'react'
import { KEY_BINDINGS, LEVEL1_DANCE_DURATION_MS, LEVEL7_DANCE_DURATION_MS } from './constants'
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
  spawnSingleMino,
  hasMidSpawn,
  hasSingleMinoSpawn,
  getMidSpawnDelay,
  getSingleMinoSpawnDelay,
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
  const singleMinoSpawnTimerRef = useRef(null)
  const danceTimerRef = useRef(null)
  // Strict Mode에서 축하 effect가 두 번 돌아도 타이머·BGM이 중복되지 않게
  const scheduledCelebrationRef = useRef(null)
  const celebrationIdRef = useRef(0)
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

  const showFlashRef = useRef(showFlash)
  useEffect(() => {
    showFlashRef.current = showFlash
  }, [showFlash])

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
      if (levelFlashTimerRef.current) clearTimeout(levelFlashTimerRef.current)
      if (midSpawnTimerRef.current) clearTimeout(midSpawnTimerRef.current)
      if (singleMinoSpawnTimerRef.current) clearTimeout(singleMinoSpawnTimerRef.current)
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
      const isLevel1To2 = prevLevel === 1 && nextState.level === 2
      const isLevel7To8 = prevLevel === 7 && nextState.level === 8
      const isDanceLevelUp = isLevel1To2 || isLevel7To8

      if (nextState.level > prevLevel && !isDanceLevelUp) {
        nextState = applyLevelUpBoardEffects(nextState, prevLevel, nextState.level)
      }

      // 레벨 1→2 / 7→8: 춤 연출 후 다음 피스 스폰
      if (isDanceLevelUp) {
        nextState = {
          ...nextState,
          isCelebrating: true,
          celebrationKind: isLevel1To2 ? 'level1' : 'level7',
          currentPiece: null,
        }
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
    scheduledCelebrationRef.current = null
    celebrationIdRef.current += 1
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
    if (!gameState.isCelebrating || !gameState.celebrationKind) {
      scheduledCelebrationRef.current = null
      return
    }

    const kind = gameState.celebrationKind

    // React Strict Mode: cleanup이 타이머를 지우므로, 두 번째 실행은 스킵하고 첫 타이머만 유지
    if (scheduledCelebrationRef.current === kind) {
      return
    }
    scheduledCelebrationRef.current = kind

    const variant = kind === 'level1' ? 'rookie' : 'classic'
    const targetLevel = kind === 'level1' ? 2 : 8
    const duration =
      kind === 'level1' ? LEVEL1_DANCE_DURATION_MS : LEVEL7_DANCE_DURATION_MS
    const celebrationId = ++celebrationIdRef.current

    setDanceEvent({ id: Date.now(), variant })

    if (kind === 'level1') {
      sounds.level1Dance()
    } else {
      sounds.level7Dance()
    }

    danceTimerRef.current = setTimeout(() => {
      if (celebrationIdRef.current !== celebrationId) return

      setGameState((prev) => {
        if (!prev.isCelebrating || prev.celebrationKind !== kind) return prev

        let next = { ...prev, isCelebrating: false, celebrationKind: null }

        if (kind === 'level7') {
          // prev가 아닌 next 기준 — celebration 플래그가 다시 true로 덮이지 않게
          next = applyLevelUpBoardEffects(next, 7, 8)
        }

        next = spawnNextPiece(next)
        return next
      })
      sounds.levelUp()
      showFlashRef.current({ kind: 'level', level: targetLevel })
      setDanceEvent(null)
      scheduledCelebrationRef.current = null
      danceTimerRef.current = null
    }, duration)

    // cleanup에서 clearTimeout 하지 않음 — Strict Mode가 타이머를 취소해 레벨8에서 멈추는 원인
  }, [gameState.isCelebrating, gameState.celebrationKind])

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

  // 레벨 10+: 40~50초마다 1×1 블록 무작위 추가
  useEffect(() => {
    const { level, isPlaying, isPaused, gameOver, isCelebrating } = gameState

    if (!hasSingleMinoSpawn(level) || !isPlaying || isPaused || gameOver || isCelebrating) {
      if (singleMinoSpawnTimerRef.current) {
        clearTimeout(singleMinoSpawnTimerRef.current)
        singleMinoSpawnTimerRef.current = null
      }
      return
    }

    let cancelled = false

    const scheduleNext = () => {
      if (cancelled) return

      const current = gameStateRef.current
      if (
        !hasSingleMinoSpawn(current.level) ||
        !current.isPlaying ||
        current.isPaused ||
        current.gameOver ||
        current.isCelebrating
      ) {
        return
      }

      if (singleMinoSpawnTimerRef.current) {
        clearTimeout(singleMinoSpawnTimerRef.current)
        singleMinoSpawnTimerRef.current = null
      }

      const { min, max } = getSingleMinoSpawnDelay()
      const delay = min + Math.random() * (max - min)

      singleMinoSpawnTimerRef.current = setTimeout(() => {
        singleMinoSpawnTimerRef.current = null
        if (cancelled) return

        setGameState((prev) => spawnSingleMino(prev))
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      cancelled = true
      if (singleMinoSpawnTimerRef.current) {
        clearTimeout(singleMinoSpawnTimerRef.current)
        singleMinoSpawnTimerRef.current = null
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
