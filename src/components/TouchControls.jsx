import { initAudio } from '../tetris/sounds'

function TouchButton({ label, icon, onAction, className = '' }) {
  const handlePointerDown = (event) => {
    event.preventDefault()
    initAudio()
    onAction()
  }

  return (
    <button
      type="button"
      className={`touch-btn ${className}`}
      onPointerDown={handlePointerDown}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

export default function TouchControls({
  moveLeft,
  moveRight,
  softDrop,
  rotate,
  hardDrop,
  togglePause,
}) {
  return (
    <div className="touch-controls">
      <div className="touch-row top">
        <TouchButton label="회전" icon="↻" onAction={rotate} className="rotate" />
        <TouchButton label="하드 드롭" icon="⬇" onAction={hardDrop} className="hard-drop" />
        <TouchButton label="일시정지" icon="⏸" onAction={togglePause} className="pause" />
      </div>
      <div className="touch-row bottom">
        <TouchButton label="왼쪽" icon="←" onAction={moveLeft} />
        <TouchButton label="아래" icon="↓" onAction={softDrop} />
        <TouchButton label="오른쪽" icon="→" onAction={moveRight} />
      </div>
    </div>
  )
}
