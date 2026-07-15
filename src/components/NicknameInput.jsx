import { useState } from 'react'
import { loadNickname, saveNickname } from '../tetris/storage'

export default function NicknameInput({ compact = false }) {
  const [nickname, setNickname] = useState(() => loadNickname())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const trimmed = nickname.trim()
    if (trimmed.length < 2 || trimmed.length > 12) return
    saveNickname(trimmed)
    setNickname(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className={`nickname-input${compact ? ' compact' : ''}`}>
      <h3>닉네임</h3>
      <div className="nickname-row">
        <input
          type="text"
          value={nickname}
          maxLength={12}
          placeholder="2~12자"
          onChange={(event) => setNickname(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSave()}
        />
        <button type="button" className="nickname-save-btn" onClick={handleSave}>
          저장
        </button>
      </div>
      {saved && <p className="nickname-saved">저장됨!</p>}
      {!compact && (
        <p className="nickname-hint">랭킹에 올라갈 이름 (한글·영문·숫자)</p>
      )}
    </div>
  )
}
