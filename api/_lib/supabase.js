const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

export async function fetchTopScores(limit = 10) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/scores`)
  url.searchParams.set('select', 'nickname,score,created_at')
  url.searchParams.set('order', 'score.desc')
  url.searchParams.set('limit', String(limit))

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch scores: ${response.status}`)
  }

  return response.json()
}

export async function insertScore(nickname, score) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ nickname, score }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save score: ${response.status}`)
  }
}

export function sanitizeNickname(value) {
  const trimmed = String(value || '').trim()
  if (trimmed.length < 2 || trimmed.length > 12) return null
  if (!/^[a-zA-Z0-9가-힣_]+$/.test(trimmed)) return null
  return trimmed
}

export function sanitizeScore(value) {
  const score = Number(value)
  if (!Number.isFinite(score) || score <= 0 || score > 99999999) return null
  return Math.floor(score)
}
