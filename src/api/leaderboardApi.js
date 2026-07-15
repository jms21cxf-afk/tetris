export async function fetchLeaderboard() {
  const response = await fetch('/api/scores')

  if (response.status === 503) {
    return { scores: [], unavailable: true }
  }

  if (!response.ok) {
    throw new Error('Failed to load leaderboard')
  }

  const data = await response.json()
  return { scores: data.scores ?? [], unavailable: false }
}

export async function submitScore(nickname, score) {
  const response = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, score }),
  })

  if (response.status === 503) {
    return { ok: false, unavailable: true }
  }

  if (!response.ok) {
    throw new Error('Failed to submit score')
  }

  return { ok: true, unavailable: false }
}
