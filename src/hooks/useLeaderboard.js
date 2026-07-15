import { useState, useCallback, useEffect } from 'react'
import { fetchLeaderboard, submitScore as postScore } from '../api/leaderboardApi'

export function useLeaderboard(active = true) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchLeaderboard()
      setScores(result.scores)
      setUnavailable(result.unavailable)
    } catch {
      setUnavailable(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitScore = useCallback(async (nickname, score) => {
    setSubmitting(true)
    try {
      const result = await postScore(nickname, score)
      if (result.ok) {
        await refresh()
      }
      return result
    } finally {
      setSubmitting(false)
    }
  }, [refresh])

  useEffect(() => {
    if (active) {
      refresh()
    }
  }, [active, refresh])

  return {
    scores,
    loading,
    unavailable,
    submitting,
    refresh,
    submitScore,
  }
}
