export default function MuteButton({ muted, onToggle }) {
  return (
    <button
      type="button"
      className="mute-btn"
      onClick={onToggle}
      aria-label={muted ? '음소거 해제' : '음소거'}
      title={muted ? '음소거 해제 (M)' : '음소거 (M)'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
