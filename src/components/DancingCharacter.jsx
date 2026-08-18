/** 레벨 클리어 시 오락실식 춤추는 인형 (NES 테트리스 스타일) */
export default function DancingCharacter({ event, fullscreen = false, menuMode = false }) {
  if (!event) return null

  const variant = event.variant ?? 'classic'
  const rootClass = menuMode
    ? 'dance-inline'
    : `dance-overlay dance-overlay-${variant}${fullscreen ? ' dance-overlay-fullscreen' : ''}`

  return (
    <div key={event.id} className={rootClass} aria-live="polite">
      <div className="dance-scene">
        {variant === 'rookie' ? <RookieDancer /> : <ClassicDancer />}
        <div className="dance-stage" />
        {!menuMode && (
          <p className={`dance-caption dance-caption-${variant}`}>
            {variant === 'rookie' ? 'LEVEL UP!' : 'STAGE CLEAR!'}
          </p>
        )}
      </div>
    </div>
  )
}

/** 레벨 7→8 — 러시아풍 스카프 인형 (위아래 통통) */
function ClassicDancer() {
  return (
    <div className="dancer dancer-classic">
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
  )
}

/** 레벨 1→2 — 모자 쓴 초보 인형 (좌우 셔플) */
function RookieDancer() {
  return (
    <div className="dancer dancer-rookie">
      <div className="dancer-head">
        <span className="dancer-cap" />
        <span className="dancer-face dancer-face-rookie" />
      </div>
      <div className="dancer-body">
        <span className="dancer-vest" />
        <span className="dancer-shirt dancer-shirt-rookie" />
      </div>
      <div className="dancer-arms dancer-arms-rookie">
        <span className="dancer-arm dancer-arm-rookie dancer-arm-left" />
        <span className="dancer-arm dancer-arm-rookie dancer-arm-right" />
      </div>
      <div className="dancer-legs dancer-legs-rookie">
        <span className="dancer-leg dancer-leg-rookie dancer-leg-left" />
        <span className="dancer-leg dancer-leg-rookie dancer-leg-right" />
      </div>
    </div>
  )
}
