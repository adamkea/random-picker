import { useState } from 'react'

export default function ModeSelector({ onSolo, onMultiplayer, onJoin }) {
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  return (
    <div className="mode-selector">
      <div className="mode-buttons">
        <button className="btn btn-mode btn-solo" onClick={onSolo}>
          <span className="mode-icon">🏃</span>
          <span className="mode-label">Solo Race</span>
          <span className="mode-desc">Enter names &amp; pick a winner</span>
        </button>
        <button className="btn btn-mode btn-multi" onClick={onMultiplayer}>
          <span className="mode-icon">🎮</span>
          <span className="mode-label">Host Multiplayer</span>
          <span className="mode-desc">Create a room for friends to join</span>
        </button>
      </div>
      <div className="join-section">
        {!showJoin ? (
          <button className="btn-join-toggle" onClick={() => setShowJoin(true)}>
            Have a room code? Join a session
          </button>
        ) : (
          <div className="join-form">
            <input
              type="text"
              className="join-input"
              placeholder="Room code"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && joinCode.length === 4) onJoin(joinCode)
              }}
              autoFocus
            />
            <button
              className="btn btn-add"
              disabled={joinCode.length !== 4}
              onClick={() => onJoin(joinCode)}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
