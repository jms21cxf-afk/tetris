export function formatHighScore(score) {
  if (!score || score <= 0) return '없음'
  return score.toLocaleString()
}
