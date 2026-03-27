import { useState } from 'react'
import { LOTTIE_POOL } from '../lottiePool'
import LottieRacer from '../components/LottieRacer'

const DURATIONS = [
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '1 min', value: 60000 },
  { label: '1.5 min', value: 90000 },
]

export default function MultiplayerLobby({ lobbyState, playerId, onSetDuration, onStartRace, onLeave }) {
  const isHost = lobbyState.hostId === playerId
  const playerCount = lobbyState.players.length

  return (
    <div className="multiplayer-lobby">
      <div className="room-code-display">
        <span className="room-code-label">Room Code</span>
        <span className="room-code">{lobbyState.code}</span>
        <button
          className="btn-copy"
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?room=${lobbyState.code}`
            navigator.clipboard?.writeText(url)
          }}
        >
          Copy Link
        </button>
      </div>

      <div className="lobby-players">
        <h3>Players ({playerCount}/5)</h3>
        <div className="lobby-player-list">
          {lobbyState.players.map((player) => {
            const lottie = LOTTIE_POOL.find(l => l.id === player.lottieId) || LOTTIE_POOL[0]
            return (
              <div key={player.id} className="lobby-player">
                <LottieRacer src={lottie.src} size={48} speed={1} playing={true} />
                <span className="lobby-player-name">
                  {player.name}
                  {player.id === lobbyState.hostId && <span className="host-badge">HOST</span>}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {isHost ? (
        <div className="lobby-controls">
          <div className="duration-selector">
            <span className="duration-label">Race Duration:</span>
            <div className="duration-options">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  className={`duration-btn ${lobbyState.duration === d.value ? 'active' : ''}`}
                  onClick={() => onSetDuration(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn btn-start"
            disabled={playerCount < 2}
            onClick={onStartRace}
          >
            {playerCount < 2 ? 'Need at least 2 players' : `Start Race (${playerCount} players)`}
          </button>
        </div>
      ) : (
        <div className="lobby-waiting">
          <div className="waiting-dots">Waiting for host to start the race</div>
        </div>
      )}
    </div>
  )
}
