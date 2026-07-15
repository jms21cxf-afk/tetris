import {
  isConfigured,
  fetchTopScores,
  insertScore,
  sanitizeNickname,
  sanitizeScore,
} from './_lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (!isConfigured()) {
    return res.status(503).json({
      error: 'Score API is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    })
  }

  try {
    if (req.method === 'GET') {
      const scores = await fetchTopScores(10)
      return res.status(200).json({ scores })
    }

    if (req.method === 'POST') {
      const { nickname, score } = req.body ?? {}
      const cleanNickname = sanitizeNickname(nickname)
      const cleanScore = sanitizeScore(score)

      if (!cleanNickname || cleanScore === null) {
        return res.status(400).json({ error: 'Invalid nickname or score.' })
      }

      await insertScore(cleanNickname, cleanScore)
      return res.status(201).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error('Scores API error:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
