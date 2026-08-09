/** 레벨 7 클리어 시 오락실식 춤추는 인형 연출 (NES 테트리스 스타일) */
export default function DancingCharacter({ event, fullscreen = false, menuMode = false }) {
  if (!event) return null

  const rootClass = menuMode
    ? 'dance-inline'
    : `dance-overlay${fullscreen ? ' dance-overlay-fullscreen' : ''}`

  return (
    <div key={event.id} className={rootClass} aria-live="polite">
      <div className="dance-scene">
        {/* 픽셀 인형 — 팔·다리 키프레임으로 춤 */}
        <div className="dancer">
          <div className="dancer-head">
            <span className="dancer-hair" />
            <span className="dancer-face" />
          </div>
          <div className="dancer-body">
            <span className="dancer-scarf" />
            <span className="dancer-shirt" />
            <span className="dancer-belt" />
          </div>
          <div className="dancer-arms">
            <span className="dancer-arm dancer-arm-left" />
            <span className="dancer-arm dancer-arm-right" />
          </div>
          <div className="dancer-legs">
            <span className="dancer-leg dancer-leg-left" />
            <span className="dancer-leg dancer-leg-right" />
          </div>
        </div>
        <div className="dance-stage" />
        {!menuMode && <p className="dance-caption">STAGE CLEAR!</p>}
      </div>
    </div>
  )
}
